import { CAPIDispatcher } from '../../utils/codegen-utils';
import { Payout, PayoutsApiFp } from '../../api/capi-v2/codegen';
import { getPayoutParams } from './params/payout-params';

export class PayoutActions {
    private api;
    private dispatcher: CAPIDispatcher;

    constructor(accessToken: string) {
        this.dispatcher = new CAPIDispatcher({
            headers: {
                origin: 'https://dashboard.stage.empayre.com'
            }
        });
        this.api = PayoutsApiFp({
            apiKey: `Bearer ${accessToken}`
        });
    }

    createPayout(shopID: string, payoutToolID: string): Promise<Payout> {
        const params = getPayoutParams(shopID, payoutToolID);
        return this.dispatcher.callMethod(this.api.createPayout, params).then(payout => {
            return payout;
        });
    }
}
