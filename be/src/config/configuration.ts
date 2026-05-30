const DEFAULT_PORT = 3000;
const DEFAULT_MONGODB_URI = "mongodb://localhost:27017/hotel-management";
const DEFAULT_MONGODB_DB = "hotel-management";
const DEFAULT_SMTP_PORT = 587;
const DEFAULT_AUTH_TOKEN_TTL_SECONDS = 60 * 60 * 24 * 7;
const DEFAULT_AUTH_JWT_SECRET = "development-only-change-me";

function parseNumber(value: string | undefined, fallback: number): number {
  if (!value) {
    return fallback;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function parseBoolean(value: string | undefined, fallback = false): boolean {
  if (value === undefined) {
    return fallback;
  }

  return value.toLowerCase() === "true";
}

function parseCorsOrigin(value: string | undefined): string[] | true {
  if (!value || value === "*") {
    return true;
  }

  return value
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
}

export default () => ({
  app: {
    env: process.env.NODE_ENV ?? "development",
    port: parseNumber(process.env.PORT, DEFAULT_PORT),
    corsOrigin: parseCorsOrigin(process.env.CORS_ORIGIN),
  },
  mongodb: {
    uri: process.env.MONGODB_URI ?? DEFAULT_MONGODB_URI,
    dbName: process.env.MONGODB_DB ?? DEFAULT_MONGODB_DB,
    authSource:
      process.env.MONGODB_AUTH_SOURCE ??
      (process.env.MONGODB_URI?.startsWith("mongodb+srv://")
        ? "admin"
        : undefined),
  },
  smtp: {
    host: process.env.SMTP_HOST,
    port: parseNumber(process.env.SMTP_PORT, DEFAULT_SMTP_PORT),
    secure: parseBoolean(process.env.SMTP_SECURE, false),
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
    from: process.env.SMTP_FROM ?? "Hotel Management <no-reply@example.com>",
  },
  auth: {
    jwtSecret: process.env.AUTH_JWT_SECRET ?? DEFAULT_AUTH_JWT_SECRET,
    tokenTtlSeconds: parseNumber(
      process.env.AUTH_TOKEN_TTL_SECONDS,
      DEFAULT_AUTH_TOKEN_TTL_SECONDS,
    ),
  },
});
