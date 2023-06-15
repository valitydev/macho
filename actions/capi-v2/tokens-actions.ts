import * as chai from 'chai';
import {
    TokensApiFp,
    PaymentResource,
    PaymentResourceParams
} from '../../api/capi-v2/codegen';
import { CAPIDispatcher } from '../../utils/codegen-utils';

export class TokensActions {
    private api;
    private dispatcher: CAPIDispatcher;

    constructor(accessToken: string) {
        this.dispatcher = new CAPIDispatcher({
            headers: {
                origin: 'https://dashboard.stage.empayre.com'
            }
        });
        this.api = TokensApiFp({
            apiKey: `Bearer ${accessToken}`
        });
    }

    createPaymentResource(paymentTool: PaymentResourceParams): Promise<PaymentResource> {
        return this.dispatcher.callMethod(this.api.createPaymentResource, paymentTool);
    }

}
