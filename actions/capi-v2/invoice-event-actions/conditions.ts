import {
    InvoiceChange,
    InvoiceStatus,
    InvoiceStatusChanged,
    PaymentStatus,
    PaymentStatusChanged,
    RefundStatus,
    RefundStatusChanged
} from '../../../api/capi-v2/codegen';
import InvoiceChangeType = InvoiceChange.ChangeTypeEnum;
import InvoiceStatusType = InvoiceStatus.StatusEnum;
import PaymentStatusType = PaymentStatus.StatusEnum;
import RefundStatusType = RefundStatus.StatusEnum;

export type ChangeInvoiceCondition = (change: InvoiceChange) => boolean;

export function isInvoicePaid(): ChangeInvoiceCondition {
    return (change: InvoiceChange) =>
        change.changeType === InvoiceChangeType.InvoiceStatusChanged &&
        (change as InvoiceStatusChanged).status === InvoiceStatusType.Paid;
}

export function isInvoiceUnpaid(): ChangeInvoiceCondition {
    return (change: InvoiceChange) =>
        change.changeType === InvoiceChangeType.InvoiceStatusChanged &&
        (change as InvoiceStatusChanged).status === InvoiceStatusType.Unpaid;
}

export function isInvoiceInteracted(): ChangeInvoiceCondition {
    return (change: InvoiceChange) =>
        change.changeType === InvoiceChangeType.PaymentInteractionRequested;
}

export function isPaymentCaptured(paymentID: string): ChangeInvoiceCondition {
    return (change: InvoiceChange) =>
        change.changeType === InvoiceChangeType.PaymentStatusChanged &&
        (change as PaymentStatusChanged).paymentID === paymentID &&
        (change as PaymentStatusChanged).status === PaymentStatusType.Captured;
}

export function isPaymentFailed(paymentID: string): ChangeInvoiceCondition {
    return (change: InvoiceChange) =>
        change.changeType === InvoiceChangeType.PaymentStatusChanged &&
        (change as PaymentStatusChanged).paymentID === paymentID &&
        (change as PaymentStatusChanged).status === PaymentStatusType.Failed;
}

export function isPaymentPending(paymentID: string): ChangeInvoiceCondition {
    return (change: InvoiceChange) =>
        change.changeType === InvoiceChangeType.PaymentStatusChanged &&
        (change as PaymentStatusChanged).paymentID === paymentID &&
        (change as PaymentStatusChanged).status === PaymentStatusType.Pending;
}

export function isPaymentProcessed(paymentID: string): ChangeInvoiceCondition {
    return (change: InvoiceChange) =>
        change.changeType === InvoiceChangeType.PaymentStatusChanged &&
        (change as PaymentStatusChanged).paymentID === paymentID &&
        (change as PaymentStatusChanged).status === PaymentStatusType.Processed;
}

export function isPaymentRefunded(paymentID: string): ChangeInvoiceCondition {
    return (change: InvoiceChange) =>
        change.changeType === InvoiceChangeType.PaymentStatusChanged &&
        (change as PaymentStatusChanged).paymentID === paymentID &&
        (change as PaymentStatusChanged).status === PaymentStatusType.Refunded;
}

export function isRefundSucceeded(paymentID: string, refundID: string): ChangeInvoiceCondition {
    return (change: InvoiceChange) =>
        change.changeType === InvoiceChangeType.RefundStatusChanged &&
        (change as RefundStatusChanged).paymentID === paymentID &&
        (change as RefundStatusChanged).refundID === refundID &&
        (change as RefundStatusChanged).status === RefundStatusType.Succeeded;
}
