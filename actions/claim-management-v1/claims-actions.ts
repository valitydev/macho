import * as chai from 'chai';
import { claimManagementEndpoint } from '../../settings';
import {
    ClaimsApiFp,
    Claim,
    Modification
} from '../../api/claim-management-v0/codegen';
import { shopClaimChangeset } from '../../api/claim-management-v0/params/live-shop-claim-params';
import { APIDispatcher } from '../../utils/codegen-utils';
import { AuthActions } from '../auth-actions';

chai.should();

export class ClaimsActions {
    private api;
    private dispatcher: APIDispatcher;
    private static instance: ClaimsActions;

    static async getInstance(): Promise<ClaimsActions> {
        if (this.instance) {
            return this.instance;
        }
        const token = await AuthActions.getInstance().getExternalAccessToken();
        this.instance = new ClaimsActions(token);
        return this.instance;
    }

    constructor(accessToken: string) {
        this.dispatcher = new APIDispatcher(`${claimManagementEndpoint}/v1`, {
            headers: {
                'content-type': 'application/json; charset=utf-8',
                'origin': 'https://dashboard.stage.empayre.com'
            }
        });
        this.api = ClaimsApiFp({
            apiKey: `Bearer ${accessToken}`
        });
    }

    createClaim(partyID: string, changeset: Array<Modification>): Promise<Claim> {
        return this.dispatcher.callMethod(this.api.createClaim, partyID, changeset, undefined);
    }

    createShopClaim(partyID: string, shopID?: string): Promise<Claim> {
        return this.createClaim(partyID, shopClaimChangeset(shopID));
    }

    getClaim(partyID: string, claimID: number): Promise<Claim> {
        return this.dispatcher.callMethod(this.api.getClaimByID, partyID, claimID, undefined);
    }

}
