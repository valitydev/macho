import {
    ClaimsActions,
    InvoicesActions,
    PaymentsActions,
    TokensActions,
    PartiesActions
} from '../actions/capi-v2';
import { PapiClaimsActions, PapiPayoutsActions } from '../actions/papi-v1';
import * as chai from 'chai';
import { AnapiSearchActions, AuthActions, IdentitiesActions, WalletsActions } from '../actions';
import { ShopConditions } from '../conditions/shop-conditions';
import { PayoutActions } from '../actions/capi-v2/payout-actions';
import { ContractPayoutToolInfoModification, Payout } from '../api/capi-v2/codegen';
import delay from '../utils/delay';
import * as moment from 'moment';

chai.should();

describe('Wallet payout', () => {
    let liveShopID: string;
    let liveContractID: string;
    let partyID: string;
    let payoutID: string;
    let payoutToolID: string;
    let invoiceActions: InvoicesActions;
    let paymentActions: PaymentsActions;
    let papiPayoutsActions: PapiPayoutsActions;
    let claimsActions: ClaimsActions;
    let papiClaimsActions: PapiClaimsActions;
    let walletsActions: WalletsActions;
    let identityActions: IdentitiesActions;
    let payoutActions: PayoutActions;

    before(async () => {
        const authActions = AuthActions.getInstance();
        const shopConditions = await ShopConditions.getInstance();
        const [externalAccessToken, internalAccessToken, liveShop] = await Promise.all([
            authActions.getExternalAccessToken(),
            authActions.getInternalAccessToken(),
            shopConditions.createShop()
        ]);
        invoiceActions = new InvoicesActions(externalAccessToken);
        paymentActions = new PaymentsActions(externalAccessToken);
        claimsActions = new ClaimsActions(externalAccessToken);
        papiPayoutsActions = new PapiPayoutsActions(internalAccessToken);
        papiClaimsActions = new PapiClaimsActions(internalAccessToken);
        walletsActions = new WalletsActions(externalAccessToken);
        identityActions = new IdentitiesActions(externalAccessToken);
        payoutActions = new PayoutActions(externalAccessToken);
        liveShopID = liveShop.id;
        liveContractID = liveShop.contractID;
        const partyActions = new PartiesActions(externalAccessToken);
        const party = await partyActions.getActiveParty();
        partyID = party.id;
    });

    describe('Create wallet payout tool', async () => {
        let walletID: string;

        before(async () => {
            const identityID = (await identityActions.createIdentity()).id;
            walletID = (await walletsActions.createNewWallet(identityID)).id;
        });

        it('should add wallet payout tool to contract', async () => {
            const claim = await claimsActions.createWalletPayoutToolClaimForLiveShop(
                liveContractID,
                walletID
            );
            payoutToolID = (claim.changeset[0] as ContractPayoutToolInfoModification).payoutToolID;
            await papiClaimsActions.acceptClaimByID(partyID, claim.id, 1);
        });
    });

    describe('Account replenishment', async () => {
        let simpleInvoice, paymentResource;
        before(async () => {
            simpleInvoice = await invoiceActions.createSimpleInvoice(liveShopID, 10000);
            const invoiceAccessToken = simpleInvoice.invoiceAccessToken.payload;
            const tokensActions = new TokensActions(invoiceAccessToken);
            paymentResource = await tokensActions.createSaneVisaPaymentResource();
        });

        it('should create instant payment', async () => {
            const paymentID = (await paymentActions.createInstantPayment(
                simpleInvoice.invoice.id,
                paymentResource
            )).id;
            await paymentActions.waitPayment(paymentID, simpleInvoice.invoice.shopID);
        });
    });

    async function pollCreatePayout() {
        let result: Payout;
        while (!result) {
            try {
                result = await payoutActions.createPayout(liveShopID, payoutToolID);
            } catch (e) {
                await delay(500);
            }
        }
        return result;
    }

    describe('Create wallet payout', async () => {
        it('should create wallet payout', async () => {
            const payout = await Promise.race([delay(10000), pollCreatePayout()]);
            if (!payout) {
                throw new Error('Wait createPayout result timeout');
            }
            payoutID = payout.id;
        });
    });

    describe('Confirm wallet payout', async () => {
        it('should confirm payout', async () => {
            await papiPayoutsActions.confirmPayouts([payoutID]).catch(e => {
                e.status.should.eq(500);
            });
        });
    });
    describe('search', () => {
        async function pollAnapiSearchPayouts(): Promise<Payout[]> {
            const searchActions = await AnapiSearchActions.getInstance();
            let result = [];
            while (result.length === 0) {
                result = (await searchActions.searchPayouts(
                    partyID,
                    moment().subtract(1, 'minutes'),
                    moment(),
                    10,
                    liveShopID
                )).result;
                await delay(1000);
            }
            return result;
        }

        it('should search wallet payout in anapi', async () => {
            const result = await Promise.race([delay(10000), pollAnapiSearchPayouts()]);
            if (!result) {
                throw new Error('Wait searchPayouts result timeout');
            }
            result.length.should.eq(1);
            result[0].shopID.should.eq(liveShopID);
        });
    });
});
