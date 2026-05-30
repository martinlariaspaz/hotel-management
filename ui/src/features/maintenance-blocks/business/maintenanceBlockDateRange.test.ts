import { describe, expect, it } from '@jest/globals';
import {
  isDateOnlyValue,
  isMaintenanceBlockDateRangeValid,
} from './maintenanceBlockDateRange';

describe('maintenanceBlockDateRange', () => {
  it('accepts valid date-only values', () => {
    expect(isDateOnlyValue('2026-06-01')).toBe(true);
  });

  it('rejects invalid or ambiguous date values', () => {
    expect(isDateOnlyValue('2026-13-01')).toBe(false);
    expect(isDateOnlyValue('2026-06-01T00:00:00.000Z')).toBe(false);
  });

  it('requires the end date to be after the start date', () => {
    expect(isMaintenanceBlockDateRangeValid('2026-06-01', '2026-06-02')).toBe(
      true,
    );
    expect(isMaintenanceBlockDateRangeValid('2026-06-01', '2026-06-01')).toBe(
      false,
    );
    expect(isMaintenanceBlockDateRangeValid('2026-06-02', '2026-06-01')).toBe(
      false,
    );
  });
});
