import {
  getPaymentStatusColor,
  getPaymentStatusLabel,
  getReservationStatusColor,
  getReservationStatusLabel,
  getRoomStatusColor,
  getRoomStatusLabel,
} from './statusPresentation';
import type { StatusTranslator } from './statusPresentation';

function createTranslator(): jest.MockedFunction<StatusTranslator> {
  return jest.fn((key) => `label:${key}`);
}

describe('statusPresentation', () => {
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
