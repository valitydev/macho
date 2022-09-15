import * as chai from 'chai';
import { ClaimsApiForTests, PapiFactory } from '../../api/papi-v1';
import { AuthActions } from '../auth-actions';

chai.should();

export class PapiClaimsActions {
    private api;
    private static instance: PapiClaimsActions;

    static async getInstance() {
        if (this.instance) {
            return this.instance;
        }
        const token = await AuthActions.getInstance().getInternalAccessToken();
        this.instance = new PapiClaimsActions(token);
        return this.instance;
    }

    constructor(accessToken: string) {
        this.api = PapiFactory.getInstance(ClaimsApiForTests.name, accessToken);
    }

    acceptClaimByID(partyID: string, claimID: number, claimRevision: number): Promise<void> {
        return this.api.acceptClaimByIDForTests(partyID, claimID, claimRevision);
    }
}
