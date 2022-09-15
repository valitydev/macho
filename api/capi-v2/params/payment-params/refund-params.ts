import { RefundParams } from '../../codegen';

export function refundParams(
    amount?: number,
    currency?: string,
    externalID?: string
): RefundParams {
    return {
        amount: amount,
        currency: currency,
        reason: 'Some reason',
        externalID: externalID
    };
}
