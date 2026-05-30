import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import {
  BlacklistedToken,
  BlacklistedTokenDocument,
} from "../schemas/blacklisted-token.schema";

@Injectable()
export class TokenBlacklistService {
  constructor(
    @InjectModel(BlacklistedToken.name)
    private readonly blacklistedTokenModel: Model<BlacklistedTokenDocument>,
  ) {}

  async blacklistToken(
    jti: string,
    userId: string,
    expiresAt: Date,
  ): Promise<void> {
    await this.blacklistedTokenModel.updateOne(
      { jti },
      {
        $setOnInsert: {
          jti,
          userId,
          expiresAt,
        },
      },
      { upsert: true },
    );
  }

  async isBlacklisted(jti: string): Promise<boolean> {
    const token = await this.blacklistedTokenModel.exists({ jti });

    return token !== null;
  }
}
