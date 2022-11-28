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
        return this.dispatcher.callMethod(
            this.api.createIdentity,
            simpleIdentity,
            undefined
        );
    }

    async getIdentity(identityID: string) {
        return this.dispatcher.callMethod(
            this.api.getIdentity,
            identityID,
            undefined
        );
    }

    async listIdentities(
        limit: number,
        providerID?: string,
        continuationToken?: string
    ) {
        return this.dispatcher.callMethod(
            this.api.listIdentities,
            undefined,
            limit,
            providerID,
            continuationToken
        );
    }

}
