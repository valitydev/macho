import * as chai from 'chai';
import {
    createWalletPayoutToolClaimChangeset,
    createPayoutToolClaimChangeset,
    liveShopClaimChangeset,
    testShopClaimChangeset
} from '../../api/capi-v2';
import { shopPayoutScheduleChange } from '../../api/capi-v2/params/claim-params/default-claim-params';
import { Claim, ClaimsApiFp } from '../../api/capi-v2/codegen';
import { CAPIDispatcher } from '../../utils/codegen-utils';
import { AuthActions } from '../auth-actions';

chai.should();

export class ClaimsActions {
    private api;
    private dispatcher: CAPIDispatcher;
    private static instance: ClaimsActions;

    static async getInstance() {
        if (this.instance) {
            return this.instance;
        }
        const token = await AuthActions.getInstance().getExternalAccessToken();
        this.instance = new ClaimsActions(token);
        return this.instance;
    }

    constructor(accessToken: string) {
        this.dispatcher = new CAPIDispatcher({});
        this.api = ClaimsApiFp({
            apiKey: `Bearer ${accessToken}`
        });
    }

    createClaimForTestShop(testShopID?: string): Promise<Claim> {
        return this.dispatcher
            .callMethod(this.api.createClaim, testShopClaimChangeset(testShopID))
            .then(claim => {
                claim.should.to.deep.include({
                    revision: 2,
                    status: 'ClaimAccepted'
                });
                claim.should.to.have.property('id').to.be.a('number');
                return claim;
            });
    }

    createClaimForLiveShop(liveShopID?: string): Promise<Claim> {
        return this.dispatcher
            .callMethod(this.api.createClaim, liveShopClaimChangeset(liveShopID))
            .then(claim => {
                claim.should.to.deep.include({
                    revision: 1,
                    status: 'ClaimPending'
                });
                claim.should.to.have.property('id').to.be.a('number');
                return claim;
            });
    }

    createWalletPayoutToolClaimForLiveShop(
        liveContractID: string,
        walletID: string
    ): Promise<Claim> {
        return this.dispatcher
            .callMethod(
                this.api.createClaim,
                createWalletPayoutToolClaimChangeset(liveContractID, walletID)
            )
            .then(claim => {
                claim.should.to.deep.include({
                    revision: 1,
                    status: 'ClaimPending'
                });
                claim.should.to.have.property('id').to.be.a('number');
                return claim;
            });
    }

    createPayoutToolClaimForLiveShop(liveContractID: string): Promise<Claim> {
        return this.dispatcher
            .callMethod(this.api.createClaim, createPayoutToolClaimChangeset(liveContractID))
            .then(claim => {
                claim.should.to.deep.include({
                    revision: 1,
                    status: 'ClaimPending'
                });
                claim.should.to.have.property('id').to.be.a('number');
                return claim;
            });
    }

    createClaimForLiveShopWithSchedule(liveShopID?: string, scheduleID?: number): Promise<Claim> {
        return this.dispatcher
            .callMethod(this.api.createClaim, [shopPayoutScheduleChange(liveShopID, scheduleID)])
            .then(claim => {
                claim.should.to.deep.include({
                    revision: 1,
                    status: 'ClaimPending'
                });
                claim.should.to.have.property('id').to.be.a('number');
                return claim;
            });
    }

    getPendingClaimByID(claimID: number): Promise<Claim> {
        return this.dispatcher.callMethod(this.api.getClaimByID, claimID).then(claim => {
            claim.should.to.deep.include({
                id: claimID,
                status: 'ClaimPending'
            });
            return claim;
        });
    }

    getAcceptedClaimByID(claimID: number): Promise<Claim> {
        return this.dispatcher.callMethod(this.api.getClaimByID, claimID).then(claim => {
            claim.should.to.deep.include({
                id: claimID,
                status: 'ClaimAccepted'
            });
            return claim;
        });
    }
}
