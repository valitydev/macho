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
        const providers = await this.dispatcher.callMethod(
            this.api.listProviders,
            undefined,
            residence
        );
        providers.should.property('length').not.equal(0);
        providers[0].should.contain.keys('id', 'name', 'residences');
        return providers;
    }

    async getProvider(providerID: string) {
        const provider = await this.dispatcher.callMethod(
            this.api.getProvider,
            providerID,
            undefined
        );
        provider.should.contain.keys('id', 'name', 'residences');
        return provider;
    }

    async listProviderIdentityClasses(providerID: string) {
        const classes = await this.dispatcher.callMethod(
            this.api.listProviderIdentityClasses,
            providerID,
            undefined
        );
        classes.should.property('length').not.equal(0);
        classes[0].should.contain.keys('id', 'name');
        return classes;
    }

    async getProviderIdentityClass(providerID: string, identityClassID: string) {
        const identityClass = await this.dispatcher.callMethod(
            this.api.getProviderIdentityClass,
            providerID,
            identityClassID,
            undefined
        );
        identityClass.should.contain.keys('id', 'name');
        return identityClass;
    }

    async listProviderIdentityLevels(providerID: string, identityClassID: string) {
        try {
            const levels = await this.dispatcher.callMethod(
                this.api.listProviderIdentityLevels,
                providerID,
                identityClassID,
                undefined
            );
            levels.should.property('length').not.equal(0);
            levels[0].should.contain.keys('id', 'name', 'challenges');
            return levels;
        } catch (e) {
            e.status.should.equal(501);
            e.statusText.should.equal('Not Implemented');
        }
    }

    async getProviderIdentityLevel(
        providerID: string,
        identityClassID: string,
        identityLevelID: string
    ) {
        try {
            const level = await this.dispatcher.callMethod(
                this.api.getProviderIdentityLevel,
                providerID,
                identityClassID,
                identityLevelID,
                undefined
            );
            level.should.contain.keys('id', 'name', 'challenges');
            return level;
        } catch (e) {
            e.status.should.equal(501);
            e.statusText.should.equal('Not Implemented');
        }
    }

    async getResidence(residenceID: string) {
        const residence = await this.dispatcher.callMethod(
            this.residenceAPI.getResidence,
            residenceID,
            undefined
        );
        residence.should.contain.keys('id', 'name');
        return residence;
    }

    async getCurrency(currencyID: string) {
        const currency = await this.dispatcher.callMethod(
            this.currenciesAPI.getCurrency,
            currencyID,
            undefined
        );
        currency.should.contain.keys('id', 'numericCode', 'name', 'exponent');
        return currency;
    }
}
