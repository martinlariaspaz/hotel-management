import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { doNightlyStaysOverlap } from "./nightly-stay-overlap";

describe("doNightlyStaysOverlap", () => {
  it("detects overlapping nightly stays", () => {
    assert.equal(
      doNightlyStaysOverlap(
        {
          checkIn: new Date("2026-06-01T00:00:00.000Z"),
          checkOut: new Date("2026-06-04T00:00:00.000Z"),
        },
        {
          checkIn: new Date("2026-06-03T00:00:00.000Z"),
          checkOut: new Date("2026-06-06T00:00:00.000Z"),
        },
      ),
      true,
    );
  });

  it("allows same-day checkout and check-in", () => {
    assert.equal(
      doNightlyStaysOverlap(
        {
          checkIn: new Date("2026-06-01T00:00:00.000Z"),
          checkOut: new Date("2026-06-04T00:00:00.000Z"),
        },
        {
          checkIn: new Date("2026-06-04T00:00:00.000Z"),
          checkOut: new Date("2026-06-06T00:00:00.000Z"),
        },
      ),
      false,
    );
  });

  it("does not overlap when the first stay starts after the second checkout", () => {
    assert.equal(
      doNightlyStaysOverlap(
        {
          checkIn: new Date("2026-06-07T00:00:00.000Z"),
          checkOut: new Date("2026-06-09T00:00:00.000Z"),
        },
        {
          checkIn: new Date("2026-06-01T00:00:00.000Z"),
          checkOut: new Date("2026-06-07T00:00:00.000Z"),
        },
      ),
      false,
    );
  });
});
