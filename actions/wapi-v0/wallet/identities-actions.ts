import { IdentitiesApiFp } from '../../../api/wapi-v0/wallet/codegen';
import { getSimpleIdentityParams } from '../../../api/wapi-v0/wallet/params/identities-params/simple-identity-params';
import { WAPIDispatcher } from '../../../utils/codegen-utils';

export class IdentitiesActions {
    private api;
    private dispatcher: WAPIDispatcher;

    constructor(accessToken: string) {
        this.dispatcher = new WAPIDispatcher({
            headers: {
                origin: 'https://dashboard.stage.empayre.com'
            }
        });
        this.api = IdentitiesApiFp({
            apiKey: `Bearer ${accessToken}`
        });
    }

    async createIdentity(partyID: string) {
        const simpleIdentity = getSimpleIdentityParams(partyID);
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
        partyID: string,
        providerID?: string,
        continuationToken?: string
    ) {
        return this.dispatcher.callMethod(
            this.api.listIdentities,
            undefined,
            partyID,
            providerID,
            continuationToken
        );
    }

}
