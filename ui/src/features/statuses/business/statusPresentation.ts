import type { TranslationKey } from '../../../i18n';
import type {
  PaymentStatus,
  ReservationStatus,
  RoomStatus,
  StatusColor,
} from '../types';

export type StatusTranslator = (key: TranslationKey) => string;

export type StatusPresentation<TStatus extends string> = {
  color: StatusColor;
  labelKey: TranslationKey;
  status: TStatus;
};

export const reservationStatusPresentation: Record<
  ReservationStatus,
  StatusPresentation<ReservationStatus>
> = {
  pending_confirmation: {
    color: 'yellow',
    labelKey: 'common.domainStatuses.reservation.pendingConfirmation',
    status: 'pending_confirmation',
  },
  confirmed: {
    color: 'blue',
    labelKey: 'common.domainStatuses.reservation.confirmed',
    status: 'confirmed',
  },
  checked_in: {
    color: 'teal',
    labelKey: 'common.domainStatuses.reservation.checkedIn',
    status: 'checked_in',
  },
  checked_out: {
    color: 'gray',
    labelKey: 'common.domainStatuses.reservation.checkedOut',
    status: 'checked_out',
  },
  cancelled: {
    color: 'red',
    labelKey: 'common.domainStatuses.reservation.cancelled',
    status: 'cancelled',
  },
  no_show: {
    color: 'orange',
    labelKey: 'common.domainStatuses.reservation.noShow',
    status: 'no_show',
  },
};

export const roomStatusPresentation: Record<
  RoomStatus,
  StatusPresentation<RoomStatus>
> = {
  available: {
    color: 'teal',
    labelKey: 'common.domainStatuses.room.available',
    status: 'available',
  },
  reserved: {
    color: 'blue',
    labelKey: 'common.domainStatuses.room.reserved',
    status: 'reserved',
  },
  occupied: {
    color: 'indigo',
    labelKey: 'common.domainStatuses.room.occupied',
    status: 'occupied',
  },
  cleaning: {
    color: 'cyan',
    labelKey: 'common.domainStatuses.room.cleaning',
    status: 'cleaning',
  },
  dirty: {
    color: 'yellow',
    labelKey: 'common.domainStatuses.room.dirty',
    status: 'dirty',
  },
  maintenance: {
    color: 'orange',
    labelKey: 'common.domainStatuses.room.maintenance',
    status: 'maintenance',
  },
  out_of_service: {
    color: 'red',
    labelKey: 'common.domainStatuses.room.outOfService',
    status: 'out_of_service',
  },
};

export const paymentStatusPresentation: Record<
  PaymentStatus,
  StatusPresentation<PaymentStatus>
> = {
  unpaid: {
    color: 'red',
    labelKey: 'common.domainStatuses.payment.unpaid',
    status: 'unpaid',
  },
  deposit_paid: {
    color: 'blue',
    labelKey: 'common.domainStatuses.payment.depositPaid',
    status: 'deposit_paid',
  },
  partially_paid: {
    color: 'yellow',
    labelKey: 'common.domainStatuses.payment.partiallyPaid',
    status: 'partially_paid',
  },
  paid: {
    color: 'teal',
    labelKey: 'common.domainStatuses.payment.paid',
    status: 'paid',
  },
  refund_due: {
    color: 'orange',
    labelKey: 'common.domainStatuses.payment.refundDue',
    status: 'refund_due',
  },
  refunded: {
    color: 'gray',
    labelKey: 'common.domainStatuses.payment.refunded',
    status: 'refunded',
  },
};

export function getReservationStatusPresentation(
  status: ReservationStatus,
): StatusPresentation<ReservationStatus> {
  return reservationStatusPresentation[status];
}

export function getReservationStatusColor(status: ReservationStatus): StatusColor {
  return getReservationStatusPresentation(status).color;
}

export function getReservationStatusLabel(
  status: ReservationStatus,
  translate: StatusTranslator,
): string {
  return translate(getReservationStatusPresentation(status).labelKey);
}

export function getRoomStatusPresentation(
  status: RoomStatus,
): StatusPresentation<RoomStatus> {
  return roomStatusPresentation[status];
}

export function getRoomStatusColor(status: RoomStatus): StatusColor {
  return getRoomStatusPresentation(status).color;
}

export function getRoomStatusLabel(
  status: RoomStatus,
  translate: StatusTranslator,
): string {
  return translate(getRoomStatusPresentation(status).labelKey);
}

export function getPaymentStatusPresentation(
  status: PaymentStatus,
): StatusPresentation<PaymentStatus> {
  return paymentStatusPresentation[status];
}

export function getPaymentStatusColor(status: PaymentStatus): StatusColor {
  return getPaymentStatusPresentation(status).color;
}

export function getPaymentStatusLabel(
  status: PaymentStatus,
  translate: StatusTranslator,
): string {
  return translate(getPaymentStatusPresentation(status).labelKey);
}

const statusPresentation = {
  getPaymentStatusColor,
  getPaymentStatusLabel,
  getPaymentStatusPresentation,
  getReservationStatusColor,
  getReservationStatusLabel,
  getReservationStatusPresentation,
  getRoomStatusColor,
  getRoomStatusLabel,
  getRoomStatusPresentation,
  paymentStatusPresentation,
  reservationStatusPresentation,
  roomStatusPresentation,
} as const;

export default statusPresentation;
