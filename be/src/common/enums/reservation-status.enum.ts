export enum ReservationStatus {
  PendingConfirmation = "pending_confirmation",
  Confirmed = "confirmed",
  CheckedIn = "checked_in",
  CheckedOut = "checked_out",
  Cancelled = "cancelled",
  NoShow = "no_show",
}

export const RESERVATION_STATUS_VALUES = Object.values(ReservationStatus);
