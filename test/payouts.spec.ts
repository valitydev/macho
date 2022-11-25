import * as chai from 'chai';
import * as moment from 'moment';
import {
    // ClaimsActions,
    PartiesActions
} from '../actions/capi-v2';
import { AuthActions } from '../actions';
import { PaymentConditions, ShopConditions } from '../conditions';
import { Payout } from '../api/capi-v2/codegen';
import { PayoutActions } from '../actions/capi-v2/payout-actions';
// import { ContractPayoutToolInfoModification } from '../api/capi-v2/codegen';
import delay from '../utils/delay';

chai.should();

describe('Payouts', () => {
    let shopID: string;
    let partyID: string;
    let contractID: string;
    let payoutToolID: string;
    let shopConditions: ShopConditions;
    let capiPayoutActions: PayoutActions;
    // let claimsActions: ClaimsActions;
    let payoutID: string;

    before(async () => {
        const authActions = AuthActions.getInstance();
        shopConditions = await ShopConditions.getInstance();
        const shop = await shopConditions.createShop();
        const externalAccessToken = await authActions.getExternalAccessToken();
        const internalAccessToken = await authActions.getInternalAccessToken();
        shopID = shop.id;
        contractID = shop.contractID;
        // claimsActions = new ClaimsActions(externalAccessToken);
        capiPayoutActions = new PayoutActions(externalAccessToken);
        const partyActions = await PartiesActions.getInstance();
        partyID = (await partyActions.getActiveParty()).id;
    });

    // describe('Create payout tool', async () => {
    //     it('should add payout tool to contract', async () => {
    //         const claim = await claimsActions.createPayoutToolClaimForLiveShop(contractID);
    //         payoutToolID = (claim.changeset[0] as ContractPayoutToolInfoModification).payoutToolID;
    //         await papiClaimsActions.acceptClaimByID(partyID, claim.id, 1);
    //     });
    // });

    // describe('Create payout', async () => {
    //     it('should create payout', async () => {
    //         const paymentConditions = await PaymentConditions.getInstance();
    //         await paymentConditions.proceedInstantPayment(shopID, 10000);

    //         const payout = await Promise.race([delay(10000), pollCreatePayout()]);
    //         if (!payout) {
    //             throw new Error('Wait createPayout result timeout');
    //         }
    //         payoutID = payout.id;
    //     });

    //     it('should payout payed', async () => {
    //         await papiPayoutActions.confirmPayouts([payoutID]);
    //     });
    // });

    // async function pollCreatePayout() {
    //     let result: Payout;
    //     while (!result) {
    //         try {
    //             result = await capiPayoutActions.createPayout(shopID, payoutToolID);
    //         } catch (e) {
    //             await delay(500);
    //         }
    //     }
    //     return result;
    // }

    // describe('search', () => {
    //     async function pollAnapiSearchPayouts(): Promise<Payout[]> {
    //         const searchActions = await AnapiSearchActions.getInstance();
    //         let result = [];
    //         while (result.length === 0) {
    //             result = (await searchActions.searchPayouts(
    //                 partyID,
    //                 moment().subtract(1, 'minutes'),
    //                 moment(),
    //                 10,
    //                 shopID
    //             )).result;
    //             await delay(1000);
    //         }
    //         return result;
    //     }

    //     it('should search payout in anapi', async () => {
    //         const result = await Promise.race([delay(10000), pollAnapiSearchPayouts()]);
    //         if (!result) {
    //             throw new Error('Wait searchPayouts result timeout');
    //         }
    //         result.length.should.eq(1);
    //         result[0].shopID.should.eq(shopID);
    //     });
    // });

    after(async () => {
        await shopConditions.turnOffPayoutSchedule(shopID);
    });
});
