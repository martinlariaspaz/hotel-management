import { ReservationStatus } from "../../common/enums";
import { HotelBusinessConflictException } from "../../common/errors";

export const RESERVATION_STATUS_TRANSITION_CONFLICT_CODE =
  "INVALID_RESERVATION_STATUS_TRANSITION";

export const RESERVATION_STATUS_UNCHANGED_CONFLICT_CODE =
  "RESERVATION_STATUS_UNCHANGED";

export const RESERVATION_STATUS_TRANSITIONS: Readonly<
  Record<ReservationStatus, readonly ReservationStatus[]>
> = {
  [ReservationStatus.PendingConfirmation]: [
    ReservationStatus.Confirmed,
    ReservationStatus.Cancelled,
  ],
  [ReservationStatus.Confirmed]: [
    ReservationStatus.CheckedIn,
    ReservationStatus.Cancelled,
    ReservationStatus.NoShow,
  ],
  [ReservationStatus.CheckedIn]: [ReservationStatus.CheckedOut],
  [ReservationStatus.CheckedOut]: [],
  [ReservationStatus.Cancelled]: [],
  [ReservationStatus.NoShow]: [],
};

export function getAllowedReservationStatusTransitions(
  currentStatus: ReservationStatus,
): ReservationStatus[] {
  return [...RESERVATION_STATUS_TRANSITIONS[currentStatus]];
}

export function canTransitionReservationStatus(
  currentStatus: ReservationStatus,
  nextStatus: ReservationStatus,
): boolean {
  return RESERVATION_STATUS_TRANSITIONS[currentStatus].includes(nextStatus);
}

export function assertReservationStatusTransition(
  currentStatus: ReservationStatus,
  nextStatus: ReservationStatus,
): void {
  const allowedStatuses = getAllowedReservationStatusTransitions(currentStatus);

  if (currentStatus === nextStatus) {
    throw new HotelBusinessConflictException(
      "Reservation is already in the requested status",
      {
        status: currentStatus,
      },
      RESERVATION_STATUS_UNCHANGED_CONFLICT_CODE,
    );
  }

  if (!allowedStatuses.includes(nextStatus)) {
    throw new HotelBusinessConflictException(
      "Reservation status transition is not allowed",
      {
        currentStatus,
        nextStatus,
        allowedStatuses,
      },
      RESERVATION_STATUS_TRANSITION_CONFLICT_CODE,
    );
  }
}

export default assertReservationStatusTransition;
