export type PublicReservationGuestInput = {
  email: string;
  name: string;
  phone: string;
};

type PublicReservationRequest = {
  checkInDate: string;
  checkOutDate: string;
  guest: PublicReservationGuestInput;
  guestCount: number;
  notes?: string;
  policyAccepted: true;
  roomTypeId: string;
};

export type { PublicReservationRequest as default };
