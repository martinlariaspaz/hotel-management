import { Body, Controller, Get, Headers, Post, Req, UseGuards } from "@nestjs/common";
import { LoginDto } from "./dto/login.dto";
import { JwtAuthGuard } from "./guards/jwt-auth.guard";
import { AuthService } from "./services/auth.service";
import { AuthenticatedRequest } from "./types/auth.types";
import { extractBearerToken } from "./utils/extract-bearer-token";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("login")
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post("refresh")
  refresh(@Headers("authorization") authorization: string | undefined) {
    const token = extractBearerToken(authorization);

    return this.authService.refresh(token);
  }

  @Post("logout")
  async logout(
    @Headers("authorization") authorization: string | undefined,
  ): Promise<{ success: true }> {
    const token = extractBearerToken(authorization);

    await this.authService.logout(token);

    return { success: true };
  }

  @Get("me")
  @UseGuards(JwtAuthGuard)
  me(@Req() request: AuthenticatedRequest) {
    return {
      user: request.auth?.user,
    };
  }
}
