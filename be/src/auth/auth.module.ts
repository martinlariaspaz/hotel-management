import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { MongooseModule } from "@nestjs/mongoose";
import { AuthController } from "./auth.controller";
import { JwtAuthGuard } from "./guards/jwt-auth.guard";
import { RolesGuard } from "./guards/roles.guard";
import {
  BlacklistedToken,
  BlacklistedTokenSchema,
} from "./schemas/blacklisted-token.schema";
import { User, UserSchema } from "./schemas/user.schema";
import { StaffUsersService } from "./services/staff-users.service";
import { AuthService } from "./services/auth.service";
import { TokenBlacklistService } from "./services/token-blacklist.service";
import { StaffUsersController } from "./staff-users.controller";

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
  controllers: [AuthController, StaffUsersController],
  providers: [
    AuthService,
    StaffUsersService,
    TokenBlacklistService,
    JwtAuthGuard,
    RolesGuard,
  ],
  exports: [AuthService, JwtAuthGuard, RolesGuard],
})
export class AuthModule {}
