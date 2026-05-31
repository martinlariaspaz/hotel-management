import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { ReservationStatus } from "../../common/enums";
import { HotelBusinessConflictException } from "../../common/errors";
import {
  RESERVATION_STATUS_TRANSITION_CONFLICT_CODE,
  RESERVATION_STATUS_UNCHANGED_CONFLICT_CODE,
  assertReservationStatusTransition,
  canTransitionReservationStatus,
  getAllowedReservationStatusTransitions,
} from "./reservation-status-transition";

describe("reservation status transitions", () => {
  it("allows the expected reservation lifecycle transitions", () => {
    assert.doesNotThrow(() =>
      assertReservationStatusTransition(
        ReservationStatus.PendingConfirmation,
        ReservationStatus.Confirmed,
      ),
    );
    assert.doesNotThrow(() =>
      assertReservationStatusTransition(
        ReservationStatus.Confirmed,
        ReservationStatus.CheckedIn,
      ),
    );
    assert.doesNotThrow(() =>
      assertReservationStatusTransition(
        ReservationStatus.CheckedIn,
        ReservationStatus.CheckedOut,
      ),
    );
    assert.doesNotThrow(() =>
      assertReservationStatusTransition(
        ReservationStatus.Confirmed,
        ReservationStatus.NoShow,
      ),
    );
  });

  it("exposes allowed next statuses for staff flows", () => {
    assert.deepEqual(
      getAllowedReservationStatusTransitions(ReservationStatus.Confirmed),
      [
        ReservationStatus.CheckedIn,
        ReservationStatus.Cancelled,
        ReservationStatus.NoShow,
      ],
    );
    assert.equal(
      canTransitionReservationStatus(
        ReservationStatus.CheckedOut,
        ReservationStatus.Cancelled,
      ),
      false,
    );
  });

  it("rejects invalid transitions with a specific business conflict code", () => {
    assert.throws(
      () =>
        assertReservationStatusTransition(
          ReservationStatus.CheckedOut,
          ReservationStatus.CheckedIn,
        ),
      (error: unknown) => {
        assert.ok(error instanceof HotelBusinessConflictException);

        const response = error.getResponse() as { code: string };

        assert.equal(
          response.code,
          RESERVATION_STATUS_TRANSITION_CONFLICT_CODE,
        );

        return true;
      },
    );
  });

  it("rejects no-op transitions with a distinct business conflict code", () => {
    assert.throws(
      () =>
        assertReservationStatusTransition(
          ReservationStatus.Confirmed,
          ReservationStatus.Confirmed,
        ),
      (error: unknown) => {
        assert.ok(error instanceof HotelBusinessConflictException);

        const response = error.getResponse() as { code: string };

        assert.equal(response.code, RESERVATION_STATUS_UNCHANGED_CONFLICT_CODE);

        return true;
      },
    );
  });
});
