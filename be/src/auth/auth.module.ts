import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { MongooseModule } from "@nestjs/mongoose";
import { AuthController } from "./auth.controller";
import { JwtAuthGuard } from "./guards/jwt-auth.guard";
import {
  BlacklistedToken,
  BlacklistedTokenSchema,
} from "./schemas/blacklisted-token.schema";
import { User, UserSchema } from "./schemas/user.schema";
import { AuthService } from "./services/auth.service";
import { TokenBlacklistService } from "./services/token-blacklist.service";

@Module({
  imports: [
    JwtModule.register({}),
    MongooseModule.forFeature([
      {
        name: BlacklistedToken.name,
        schema: BlacklistedTokenSchema,
      },
      {
        name: User.name,
        schema: UserSchema,
      },
    ]),
  ],
  controllers: [AuthController],
  providers: [AuthService, TokenBlacklistService, JwtAuthGuard],
  exports: [AuthService, JwtAuthGuard],
})
export class AuthModule {}
