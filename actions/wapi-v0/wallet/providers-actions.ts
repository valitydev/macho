import * as chai from 'chai';
import {
    CurrenciesApiFp,
    ProvidersApiFp,
    ResidencesApiFp
} from '../../../api/wapi-v0/wallet/codegen';
import { WAPIDispatcher } from '../../../utils/codegen-utils';

chai.should();

export class ProvidersActions {
    private api;
    private residenceAPI;
    private currenciesAPI;
    private dispatcher: WAPIDispatcher;

    constructor(accessToken: string) {
        this.dispatcher = new WAPIDispatcher({});
        this.api = ProvidersApiFp({
            apiKey: `Bearer ${accessToken}`
        });
        this.residenceAPI = ResidencesApiFp({
            apiKey: `Bearer ${accessToken}`
        });
        this.currenciesAPI = CurrenciesApiFp({
            apiKey: `Bearer ${accessToken}`
        });
    }

    async listProviders(residence?: string) {
        return this.dispatcher.callMethod(this.api.listProviders, undefined, residence);
    }

    async getProvider(providerID: string) {
        return this.dispatcher.callMethod(this.api.getProvider, providerID, undefined);
    }

    async getResidence(residenceID: string) {
        return this.dispatcher.callMethod(this.residenceAPI.getResidence, residenceID, undefined);
    }

    async getCurrency(currencyID: string) {
        return this.dispatcher.callMethod(this.currenciesAPI.getCurrency, currencyID, undefined);
    }
}
