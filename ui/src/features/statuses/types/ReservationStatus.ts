export type ReservationStatus =
  | 'pending_confirmation'
  | 'confirmed'
  | 'checked_in'
  | 'checked_out'
  | 'cancelled'
  | 'no_show';

export type { ReservationStatus as default };
