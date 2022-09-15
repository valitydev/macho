import * as moment from 'moment';
import {
    InvoicesEventActions,
    isPaymentRefunded,
    AuthActions,
    PaymentsActions,
    AnapiSearchActions,
    PartiesActions
} from '../../actions';
import { refundParams } from '../../api/capi-v2';
import { PaymentConditions, ShopConditions, RefundConditions } from '../../conditions';
import { RefundSearchResult } from '../../api/capi-v2/codegen';
import delay from '../../utils/delay';

describe('Refunds', () => {
    let shopID: string;
    let partyID: string;
    let paymentCondition: PaymentConditions;
    let refundConditions: RefundConditions;
    let paymentsActions: PaymentsActions;

    before(async () => {
        const shopConditions = await ShopConditions.getInstance();
        const authActions = AuthActions.getInstance();
        const [externalAccessToken, shop] = await Promise.all([
            authActions.getExternalAccessToken(),
            shopConditions.createShop()
        ]);
        shopID = shop.id;
        paymentCondition = await PaymentConditions.getInstance();
        refundConditions = await RefundConditions.getInstance();
        paymentsActions = new PaymentsActions(externalAccessToken);
        await paymentCondition.proceedInstantPayment(shopID, 10000);
        const partiesActions = new PartiesActions(externalAccessToken);
        const party = await partiesActions.getActiveParty();
        partyID = party.id;
    });

    it('should create several partial refunds', async () => {
        const { invoiceID, paymentID } = await paymentCondition.proceedInstantPayment(shopID);
        await refundConditions.provideRefund(invoiceID, paymentID, refundParams(2000, 'RUB'));
        await refundConditions.provideRefund(invoiceID, paymentID, refundParams(8000));
    });

    it('should be idempotent', async () => {
        const { invoiceID, paymentID } = await paymentCondition.proceedInstantPayment(shopID);
        let refundParamsExternalId = refundParams(2000, 'RUB', '42');
        let refund1 = await paymentsActions.createRefund(
            invoiceID,
            paymentID,
            refundParamsExternalId
        );
        let refund2 = await paymentsActions.createRefund(
            invoiceID,
            paymentID,
            refundParamsExternalId
        );
        refund1.should.to.deep.eq(refund2);
    });

    it('should fail with different params', async () => {
        const { invoiceID, paymentID } = await paymentCondition.proceedInstantPayment(shopID);
        let refund = await paymentsActions.createRefund(
            invoiceID,
            paymentID,
            refundParams(2000, 'RUB', '42')
        );
        let error = await paymentsActions.createRefundError(
            invoiceID,
            paymentID,
            refundParams(4000, 'RUB', '42')
        );
        error.message.should.to.include({
            externalID: '42',
            message: "This 'externalID' has been used by another request"
        });
    });

    describe('refund and search', () => {
        let invoiceID;
        let paymentID;

        it('should create single full refund', async () => {
            const result = await paymentCondition.proceedInstantPayment(shopID);
            invoiceID = result.invoiceID;
            paymentID = result.paymentID;
            await refundConditions.provideRefund(invoiceID, paymentID, refundParams(10000));
            const invoiceEventActions = await InvoicesEventActions.getInstance();
            await invoiceEventActions.waitConditions([isPaymentRefunded(paymentID)], invoiceID);
        });

        async function pollAnapiSearchRefunds(): Promise<RefundSearchResult[]> {
            const searchActions = await AnapiSearchActions.getInstance();
            let result = [];
            while (result.length === 0) {
                result = (await searchActions.searchRefunds(
                    partyID,
                    moment().subtract(1, 'minutes'),
                    moment(),
                    10,
                    shopID,
                    undefined,
                    invoiceID,
                    paymentID
                )).result;
                await delay(500);
            }
            return result;
        }

        it('should search refunds in anapi', async () => {
            const result = await Promise.race([delay(10000), pollAnapiSearchRefunds()]);
            if (!result) {
                throw new Error('Wait searchRefunds result timeout');
            }
            result.length.should.eq(1);
            result[0].invoiceID.should.eq(invoiceID);
            result[0].paymentID.should.eq(paymentID);
        });
    });
});
