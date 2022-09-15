import { PayoutParams } from '../../../api/capi-v2/codegen';
import guid from '../../../utils/guid';

export function getPayoutParams(shopID: string, payoutToolID: string): PayoutParams {
    return {
        id: guid(),
        shopID,
        payoutToolID,
        amount: 100,
        currency: 'RUB'
    };
}
