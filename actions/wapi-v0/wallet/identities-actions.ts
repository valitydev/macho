import * as chai from 'chai';
import { IdentitiesApiFp } from '../../../api/wapi-v0/wallet/codegen';
import { getSimpleIdentityParams } from '../../../api/wapi-v0/wallet/params/identities-params/simple-identity-params';
import { WAPIDispatcher } from '../../../utils/codegen-utils';

chai.should();

export class IdentitiesActions {
    private api;
    private dispatcher: WAPIDispatcher;

    constructor(accessToken: string) {
        this.dispatcher = new WAPIDispatcher({});
        this.api = IdentitiesApiFp({
            apiKey: `Bearer ${accessToken}`
        });
    }

    async createIdentity() {
        const simpleIdentity = getSimpleIdentityParams();
        const createdIdentity = await this.dispatcher.callMethod(
            this.api.createIdentity,
            simpleIdentity,
            undefined
        );
        createdIdentity.should.contain.keys('class', 'name', 'provider');
        return createdIdentity;
    }

    async getIdentity(identityID: string) {
        const identity = await this.dispatcher.callMethod(
            this.api.getIdentity,
            identityID,
            undefined
        );
        identity.should.contain.keys('name', 'provider', 'class');
        return identity;
    }

    async listIdentities(
        limit: number,
        providerID?: string,
        classID?: string,
        levelID?: string,
        continuationToken?: string
    ) {
        const identities = await this.dispatcher.callMethod(
            this.api.listIdentities,
            limit,
            providerID,
            classID,
            levelID,
            continuationToken,
            undefined
        );
        identities.should.contain.keys('result');
        return identities;
    }

}
