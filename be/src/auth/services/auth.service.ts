import {
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { randomUUID, scryptSync, timingSafeEqual } from "node:crypto";
import { Model, isValidObjectId } from "mongoose";
import { LoginDto } from "../dto/login.dto";
import { User, UserDocument } from "../schemas/user.schema";
import {
  AuthenticatedUser,
  AuthJwtPayload,
  AuthSession,
  VerifiedAuthJwtPayload,
} from "../types/auth.types";
import { TokenBlacklistService } from "./token-blacklist.service";

@Injectable()
export class AuthService {
  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    private readonly tokenBlacklistService: TokenBlacklistService,
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
  ) {}

  async login(credentials: LoginDto): Promise<AuthSession> {
    const user = await this.validateCredentials(credentials);

    return this.createSession(user);
  }

  async refresh(token: string): Promise<AuthSession> {
    const { payload, user } = await this.validateAccessToken(token);

    await this.blacklistPayload(payload);

    return this.createSession(user);
  }

  async logout(token: string): Promise<void> {
    const { payload } = await this.validateAccessToken(token);

    await this.blacklistPayload(payload);
  }

  async validateAccessToken(token: string): Promise<{
    token: string;
    payload: VerifiedAuthJwtPayload;
    user: AuthenticatedUser;
  }> {
    const payload = await this.verifyToken(token);

    if (!payload.jti || !payload.exp) {
      throw new UnauthorizedException("Invalid token");
    }

    const isBlacklisted = await this.tokenBlacklistService.isBlacklisted(
      payload.jti,
    );

    if (isBlacklisted) {
      throw new UnauthorizedException("Invalid token");
    }

    const verifiedPayload = {
      ...payload,
      jti: payload.jti,
      exp: payload.exp,
    };

    return {
      token,
      payload: verifiedPayload,
      user: await this.getUserFromPayload(verifiedPayload),
    };
  }

  private async validateCredentials(
    credentials: LoginDto,
  ): Promise<AuthenticatedUser> {
    const user = await this.userModel
      .findOne({
        username: credentials.username,
        isActive: true,
      })
      .exec();

    if (!user || !this.passwordMatches(credentials.password, user)) {
      throw new UnauthorizedException("Invalid username or password");
    }

    return this.toAuthenticatedUser(user);
  }

  private async createSession(user: AuthenticatedUser): Promise<AuthSession> {
    const tokenTtlSeconds = this.configService.getOrThrow<number>(
      "auth.tokenTtlSeconds",
    );
    const token = await this.jwtService.signAsync(
      {
        sub: user.id,
        username: user.username,
        role: user.role,
      },
      {
        expiresIn: tokenTtlSeconds,
        jwtid: randomUUID(),
        secret: this.getJwtSecret(),
      },
    );

    const payload = this.jwtService.decode<AuthJwtPayload>(token);

    if (!payload?.exp) {
      throw new InternalServerErrorException("Could not create session");
    }

    return {
      token,
      expiresAt: new Date(payload.exp * 1000).toISOString(),
      user,
    };
  }

  private async verifyToken(token: string): Promise<AuthJwtPayload> {
    try {
      return await this.jwtService.verifyAsync<AuthJwtPayload>(token, {
        secret: this.getJwtSecret(),
      });
    } catch {
      throw new UnauthorizedException("Invalid or expired token");
    }
  }

  private async blacklistPayload(
    payload: VerifiedAuthJwtPayload,
  ): Promise<void> {
    await this.tokenBlacklistService.blacklistToken(
      payload.jti,
      payload.sub,
      new Date(payload.exp * 1000),
    );
  }

  private async getUserFromPayload(
    payload: VerifiedAuthJwtPayload,
  ): Promise<AuthenticatedUser> {
    if (!isValidObjectId(payload.sub)) {
      throw new UnauthorizedException("Invalid token");
    }

    const user = await this.userModel
      .findOne({
        _id: payload.sub,
        username: payload.username,
        role: payload.role,
        isActive: true,
      })
      .exec();

    if (!user) {
      throw new UnauthorizedException("Invalid token");
    }

    return this.toAuthenticatedUser(user);
  }

  private getJwtSecret(): string {
    return this.configService.getOrThrow<string>("auth.jwtSecret");
  }

  private passwordMatches(password: string, user: UserDocument): boolean {
    if (user.passwordAlgorithm !== "scrypt") {
      return false;
    }

    const expectedHash = Buffer.from(user.passwordHash, "base64");

    if (expectedHash.length === 0) {
      return false;
    }

    const actualHash = scryptSync(
      password,
      Buffer.from(user.passwordSalt, "base64"),
      expectedHash.length,
    );

    return timingSafeEqual(actualHash, expectedHash);
  }

  private toAuthenticatedUser(user: UserDocument): AuthenticatedUser {
    return {
      id: user._id.toString(),
      username: user.username,
      role: user.role,
    };
  }
}
