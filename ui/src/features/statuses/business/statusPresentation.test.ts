import {
  getPaymentStatusColor,
  getPaymentStatusLabel,
  getReservationStatusColor,
  getReservationStatusLabel,
  getRoomStatusColor,
  getRoomStatusLabel,
  reservationStatusPresentation,
} from './statusPresentation';
import type {
  StatusPresentation,
  StatusTranslator,
} from './statusPresentation';
import type { ReservationStatus } from '../types';

function createTranslator(): jest.MockedFunction<StatusTranslator> {
  return jest.fn((key) => `label:${key}`);
}

describe('statusPresentation', () => {
  it('covers every reservation status with localized label keys and badge colors', () => {
    const expectedPresentation = {
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
    } satisfies Record<
      ReservationStatus,
      StatusPresentation<ReservationStatus>
    >;

    expect(reservationStatusPresentation).toEqual(expectedPresentation);
  });

  it('returns localized reservation status labels and badge colors', () => {
    const translate = createTranslator();

    expect(getReservationStatusLabel('pending_confirmation', translate)).toBe(
      'label:common.domainStatuses.reservation.pendingConfirmation',
    );
    expect(getReservationStatusColor('pending_confirmation')).toBe('yellow');
  });

  it('returns localized room status labels and badge colors', () => {
    const translate = createTranslator();

    expect(getRoomStatusLabel('out_of_service', translate)).toBe(
      'label:common.domainStatuses.room.outOfService',
    );
    expect(getRoomStatusColor('out_of_service')).toBe('red');
  });

  it('returns localized payment status labels and badge colors', () => {
    const translate = createTranslator();

    expect(getPaymentStatusLabel('refund_due', translate)).toBe(
      'label:common.domainStatuses.payment.refundDue',
    );
    expect(getPaymentStatusColor('refund_due')).toBe('orange');
  });
});
