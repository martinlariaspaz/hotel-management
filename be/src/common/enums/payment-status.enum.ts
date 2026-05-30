export enum PaymentStatus {
  Unpaid = "unpaid",
  DepositPaid = "deposit_paid",
  PartiallyPaid = "partially_paid",
  Paid = "paid",
  RefundDue = "refund_due",
  Refunded = "refunded",
}

export const PAYMENT_STATUS_VALUES = Object.values(PaymentStatus);
