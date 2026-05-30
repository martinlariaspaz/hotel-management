import { UnauthorizedException } from "@nestjs/common";

export function extractBearerToken(
  authorization: string | string[] | undefined,
): string {
  const header = Array.isArray(authorization) ? authorization[0] : authorization;

  if (!header) {
    throw new UnauthorizedException("Missing authorization token");
  }

  const [scheme, token] = header.split(" ");

  if (scheme !== "Bearer" || !token) {
    throw new UnauthorizedException("Invalid authorization token");
  }

  return token;
}
