const DATE_ONLY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const MIN_GUEST_COUNT = 1;

export type AvailabilityGuestCountValue = number | string;

export type AvailabilitySearchValidationInput = {
  checkIn: string;
  checkOut: string;
  guests: AvailabilityGuestCountValue;
};

export type AvailabilitySearchValidationError =
  | 'CHECK_IN_DATE_INVALID'
  | 'CHECK_OUT_DATE_INVALID'
  | 'CHECK_OUT_NOT_AFTER_CHECK_IN'
  | 'GUEST_COUNT_INVALID';

export type AvailabilitySearchValidationResult = {
  errors: AvailabilitySearchValidationError[];
  isValid: boolean;
};

export function isAvailabilityDateOnlyValue(value: string): boolean {
  if (!DATE_ONLY_PATTERN.test(value)) {
    return false;
  }

  const date = new Date(`${value}T00:00:00.000Z`);

  return (
    !Number.isNaN(date.getTime()) &&
    date.toISOString().slice(0, 10) === value
  );
}

export function isAvailabilityDateRangeValid(
  checkIn: string,
  checkOut: string,
): boolean {
  return (
    isAvailabilityDateOnlyValue(checkIn) &&
    isAvailabilityDateOnlyValue(checkOut) &&
    checkIn < checkOut
  );
}

export function parseAvailabilityGuestCount(
  value: AvailabilityGuestCountValue,
): number | null {
  const parsedValue =
    typeof value === 'number' ? value : Number(value.trim());

  if (!Number.isInteger(parsedValue)) {
    return null;
  }

  return parsedValue;
}

export function isAvailabilityGuestCountValid(
  value: AvailabilityGuestCountValue,
): boolean {
  const guestCount = parseAvailabilityGuestCount(value);

  return guestCount !== null && guestCount >= MIN_GUEST_COUNT;
}

export function validateAvailabilitySearchCriteria(
  input: AvailabilitySearchValidationInput,
): AvailabilitySearchValidationResult {
  const errors: AvailabilitySearchValidationError[] = [];
  const hasValidCheckIn = isAvailabilityDateOnlyValue(input.checkIn);
  const hasValidCheckOut = isAvailabilityDateOnlyValue(input.checkOut);

  if (!hasValidCheckIn) {
    errors.push('CHECK_IN_DATE_INVALID');
  }

  if (!hasValidCheckOut) {
    errors.push('CHECK_OUT_DATE_INVALID');
  }

  if (hasValidCheckIn && hasValidCheckOut && input.checkIn >= input.checkOut) {
    errors.push('CHECK_OUT_NOT_AFTER_CHECK_IN');
  }

  if (!isAvailabilityGuestCountValid(input.guests)) {
    errors.push('GUEST_COUNT_INVALID');
  }

  return {
    errors,
    isValid: errors.length === 0,
  };
}

export function isAvailabilitySearchCriteriaValid(
  input: AvailabilitySearchValidationInput,
): boolean {
  return validateAvailabilitySearchCriteria(input).isValid;
}

const availabilitySearchValidation = {
  isAvailabilityDateOnlyValue,
  isAvailabilityDateRangeValid,
  isAvailabilityGuestCountValid,
  isAvailabilitySearchCriteriaValid,
  parseAvailabilityGuestCount,
  validateAvailabilitySearchCriteria,
} as const;

export default availabilitySearchValidation;
