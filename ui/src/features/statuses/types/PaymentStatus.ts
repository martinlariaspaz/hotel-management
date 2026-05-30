export type PaymentStatus =
  | 'unpaid'
  | 'deposit_paid'
  | 'partially_paid'
  | 'paid'
  | 'refund_due'
  | 'refunded';

export type { PaymentStatus as default };
