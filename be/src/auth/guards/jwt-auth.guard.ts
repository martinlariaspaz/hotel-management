import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { AuthService } from "../services/auth.service";
import { AuthenticatedRequest } from "../types/auth.types";
import { extractBearerToken } from "../utils/extract-bearer-token";

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const token = extractBearerToken(request.headers.authorization);

    request.auth = await this.authService.validateAccessToken(token);

    return true;
  }
}
