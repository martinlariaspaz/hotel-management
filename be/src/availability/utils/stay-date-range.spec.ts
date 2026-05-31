import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  StayDateRangeValidationError,
  parseDateOnly,
  validateStayDateRange,
} from "./stay-date-range";

describe("validateStayDateRange", () => {
  it("returns UTC midnight dates and the number of booked nights", () => {
    const range = validateStayDateRange("2026-06-01", "2026-06-04");

    assert.deepEqual(range.checkIn, new Date("2026-06-01T00:00:00.000Z"));
    assert.deepEqual(range.checkOut, new Date("2026-06-04T00:00:00.000Z"));
    assert.equal(range.nights, 3);
  });

  it("rejects same-day checkout", () => {
    assert.throws(
      () => validateStayDateRange("2026-06-01", "2026-06-01"),
      StayDateRangeValidationError,
    );
  });

  it("rejects checkout before check-in", () => {
    assert.throws(
      () => validateStayDateRange("2026-06-04", "2026-06-01"),
      StayDateRangeValidationError,
    );
  });

  it("rejects invalid calendar dates", () => {
    assert.throws(
      () => parseDateOnly("2026-02-31"),
      StayDateRangeValidationError,
    );
  });

  it("rejects non-date-only values", () => {
    assert.throws(
      () => parseDateOnly("2026-06-01T00:00:00.000Z"),
      StayDateRangeValidationError,
    );
  });
});
