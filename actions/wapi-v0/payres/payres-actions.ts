import * as chai from 'chai';
import { PaymentResourcesApiFp } from '../../../api/wapi-v0/payres/codegen';
import { getBankCardParams } from '../../../api/wapi-v0/payres/params/payres-params';
import { WapiPayresDispatcher } from '../../../utils/codegen-utils';

chai.should();

export class PayresActions {
    private api;
    private dispatcher: WapiPayresDispatcher;

    constructor(accessToken: string) {
        this.dispatcher = new WapiPayresDispatcher({});
        this.api = PaymentResourcesApiFp({
            apiKey: `Bearer ${accessToken}`
        });
    }

    async storeBankCard() {
        const cardParams = getBankCardParams();
        const card = await this.dispatcher.callMethod(this.api.storeBankCard, cardParams);
        card.should.contain.keys('token', 'validUntil');
        return card;
    }
}
