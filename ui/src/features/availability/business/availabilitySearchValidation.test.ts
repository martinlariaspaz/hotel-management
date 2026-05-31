import { describe, expect, it } from '@jest/globals';
import {
  isAvailabilityDateOnlyValue,
  isAvailabilityDateRangeValid,
  isAvailabilityGuestCountValid,
  parseAvailabilityGuestCount,
  validateAvailabilitySearchCriteria,
} from './availabilitySearchValidation';

describe('availabilitySearchValidation', () => {
  it('accepts valid date-only values', () => {
    expect(isAvailabilityDateOnlyValue('2026-06-01')).toBe(true);
    expect(isAvailabilityDateOnlyValue('2028-02-29')).toBe(true);
  });

  it('rejects invalid, ambiguous, or partial date values', () => {
    expect(isAvailabilityDateOnlyValue('2026-02-29')).toBe(false);
    expect(isAvailabilityDateOnlyValue('2026-13-01')).toBe(false);
    expect(isAvailabilityDateOnlyValue('2026-06-01T00:00:00.000Z')).toBe(
      false,
    );
    expect(isAvailabilityDateOnlyValue('06/01/2026')).toBe(false);
  });

  it('requires checkout to be after checkin', () => {
    expect(isAvailabilityDateRangeValid('2026-06-01', '2026-06-02')).toBe(
      true,
    );
    expect(isAvailabilityDateRangeValid('2026-06-01', '2026-06-01')).toBe(
      false,
    );
    expect(isAvailabilityDateRangeValid('2026-06-02', '2026-06-01')).toBe(
      false,
    );
  });

  it('parses valid whole-number guest counts', () => {
    expect(parseAvailabilityGuestCount(2)).toBe(2);
    expect(parseAvailabilityGuestCount('2')).toBe(2);
    expect(isAvailabilityGuestCountValid('4')).toBe(true);
  });

  it('rejects invalid guest counts', () => {
    expect(isAvailabilityGuestCountValid(0)).toBe(false);
    expect(isAvailabilityGuestCountValid(-1)).toBe(false);
    expect(isAvailabilityGuestCountValid(1.5)).toBe(false);
    expect(isAvailabilityGuestCountValid('')).toBe(false);
    expect(isAvailabilityGuestCountValid('two')).toBe(false);
  });

  it('returns granular validation errors for forms', () => {
    expect(
      validateAvailabilitySearchCriteria({
        checkIn: '2026-06-01',
        checkOut: '2026-06-03',
        guests: 2,
      }),
    ).toEqual({
      errors: [],
      isValid: true,
    });

    expect(
      validateAvailabilitySearchCriteria({
        checkIn: '2026-06-01',
        checkOut: '2026-06-01',
        guests: 0,
      }),
    ).toEqual({
      errors: ['CHECK_OUT_NOT_AFTER_CHECK_IN', 'GUEST_COUNT_INVALID'],
      isValid: false,
    });
  });
});
