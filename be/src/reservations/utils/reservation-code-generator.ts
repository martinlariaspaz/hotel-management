import { randomBytes as createRandomBytes } from "node:crypto";
import { HotelBusinessConflictException } from "../../common/errors";

export const RESERVATION_CODE_ALPHABET =
  "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
export const RESERVATION_CODE_LENGTH = 8;
export const RESERVATION_CODE_PREFIX = "RSV";
export const RESERVATION_CODE_MAX_ATTEMPTS = 10;
export const RESERVATION_CODE_GENERATION_EXHAUSTED_CODE =
  "RESERVATION_CODE_GENERATION_EXHAUSTED";

export type ReservationCodeAvailabilityChecker = (
  code: string,
) => boolean | Promise<boolean>;

export type ReservationCodeRandomBytes = (size: number) => Uint8Array;

export type GenerateReservationCodeOptions = {
  codeLength?: number;
  prefix?: string;
  randomBytes?: ReservationCodeRandomBytes;
};

export type GenerateUniqueReservationCodeOptions =
  GenerateReservationCodeOptions & {
    isCodeAvailable: ReservationCodeAvailabilityChecker;
    maxAttempts?: number;
  };

export function generateReservationCode(
  options: GenerateReservationCodeOptions = {},
): string {
  const codeLength = options.codeLength ?? RESERVATION_CODE_LENGTH;
  const prefix = normalizeReservationCodePrefix(
    options.prefix ?? RESERVATION_CODE_PREFIX,
  );

  if (!Number.isInteger(codeLength) || codeLength < 6 || codeLength > 16) {
    throw new RangeError("Reservation code length must be between 6 and 16");
  }

  const randomBytes =
    options.randomBytes ?? ((size: number) => createRandomBytes(size));
  const bytes = randomBytes(codeLength);
  let suffix = "";

  for (let index = 0; index < codeLength; index += 1) {
    suffix += RESERVATION_CODE_ALPHABET[bytes[index] & 31];
  }

  return `${prefix}-${suffix}`;
}

export async function generateUniqueReservationCode(
  options: GenerateUniqueReservationCodeOptions,
): Promise<string> {
  const maxAttempts = options.maxAttempts ?? RESERVATION_CODE_MAX_ATTEMPTS;

  if (!Number.isInteger(maxAttempts) || maxAttempts < 1) {
    throw new RangeError("Reservation code max attempts must be at least 1");
  }

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    const code = generateReservationCode(options);

    if (await options.isCodeAvailable(code)) {
      return code;
    }
  }

  throw new HotelBusinessConflictException(
    "Unable to generate a unique reservation code",
    {
      maxAttempts,
    },
    RESERVATION_CODE_GENERATION_EXHAUSTED_CODE,
  );
}

function normalizeReservationCodePrefix(prefix: string): string {
  const normalizedPrefix = prefix.trim().toUpperCase();

  if (!/^[A-Z0-9]{2,8}$/.test(normalizedPrefix)) {
    throw new Error(
      "Reservation code prefix must be 2 to 8 uppercase letters or digits",
    );
  }

  return normalizedPrefix;
}

export default generateUniqueReservationCode;
