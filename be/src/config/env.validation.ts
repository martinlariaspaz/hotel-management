function assertPositiveInteger(
  config: Record<string, unknown>,
  key: string,
): void {
  const rawValue = config[key];

  if (rawValue === undefined || rawValue === "") {
    return;
  }

  const value = Number(rawValue);
  if (!Number.isInteger(value) || value <= 0) {
    throw new Error(`${key} must be a positive integer`);
  }
}

function assertBoolean(config: Record<string, unknown>, key: string): void {
  const rawValue = config[key];

  if (rawValue === undefined || rawValue === "") {
    return;
  }

  const value = String(rawValue).toLowerCase();
  if (value !== "true" && value !== "false") {
    throw new Error(`${key} must be true or false`);
  }
}

function assertRequiredInProduction(
  config: Record<string, unknown>,
  key: string,
): void {
  if (config.NODE_ENV !== "production") {
    return;
  }

  const rawValue = config[key];
  if (rawValue === undefined || rawValue === "") {
    throw new Error(`${key} is required in production`);
  }
}

export function validateEnv(
  config: Record<string, unknown>,
): Record<string, unknown> {
  assertPositiveInteger(config, "PORT");
  assertPositiveInteger(config, "SMTP_PORT");
  assertPositiveInteger(config, "AUTH_TOKEN_TTL_SECONDS");
  assertBoolean(config, "SMTP_SECURE");
  assertRequiredInProduction(config, "AUTH_JWT_SECRET");

  return config;
}
