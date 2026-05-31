const DATE_ONLY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;

export type StayDateRange = {
  checkIn: Date;
  checkInDate: string;
  checkOut: Date;
  checkOutDate: string;
  nights: number;
};

export class StayDateRangeValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "StayDateRangeValidationError";
  }
}

export function parseDateOnly(value: string, fieldName = "Date"): Date {
  if (!DATE_ONLY_PATTERN.test(value)) {
    throw new StayDateRangeValidationError(
      `${fieldName} must be a valid YYYY-MM-DD date`,
    );
  }

  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));

  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    throw new StayDateRangeValidationError(
      `${fieldName} must be a valid YYYY-MM-DD date`,
    );
  }

  return date;
}

export function validateStayDateRange(
  checkInDate: string,
  checkOutDate: string,
): StayDateRange {
  const checkIn = parseDateOnly(checkInDate, "Check-in date");
  const checkOut = parseDateOnly(checkOutDate, "Check-out date");

  if (checkOut <= checkIn) {
    throw new StayDateRangeValidationError(
      "Check-out date must be after check-in date",
    );
  }

  return {
    checkIn,
    checkInDate,
    checkOut,
    checkOutDate,
    nights: Math.round(
      (checkOut.getTime() - checkIn.getTime()) / MILLISECONDS_PER_DAY,
    ),
  };
}

export default validateStayDateRange;
