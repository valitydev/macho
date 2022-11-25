import moment from 'moment';
import chaiAsPromised from 'chai-as-promised';
import {
    InvoicesEventActions,
    isPaymentRefunded,
    AuthActions,
    PaymentsActions,
    PartiesActions,
    AnapiSearchActions
} from '../../actions';
import { refundParams } from '../../api/capi-v2';
import { PaymentConditions, ShopConditions, RefundConditions } from '../../conditions';
import { RefundStatus, Payment, Refund } from '../../api/capi-v2/codegen';
import until from '../../utils/until';
import { AxiosError } from 'axios';

chai.should();
chai.use(chaiAsPromised);

describe('Refunds', () => {
    let shopID: string;
    let partyID: string;
    let paymentCondition: PaymentConditions;
    let refundConditions: RefundConditions;
    let paymentsActions: PaymentsActions;
    let searchActions: AnapiSearchActions;

    before(async () => {
        const shopConditions = await ShopConditions.getInstance();
        const authActions = AuthActions.getInstance();
        const [externalAccessToken, shop] = await Promise.all([
            authActions.getExternalAccessToken(),
            shopConditions.createShop()
        ]);
        shopID = shop.id;
        paymentCondition = new PaymentConditions(externalAccessToken);
        refundConditions = new RefundConditions(externalAccessToken);
        paymentsActions = new PaymentsActions(externalAccessToken);
        searchActions = new AnapiSearchActions(externalAccessToken);
        // await paymentCondition.proceedInstantPayment(shopID, 10000);
        const partiesActions = new PartiesActions(externalAccessToken);
        const party = await partiesActions.getActiveParty();
        partyID = party.id;
    });

    describe('refund and search', () => {
        let payment: Payment;
        let refund: Refund;

        it('should create single full refund', async () => {
            payment = await paymentCondition.proceedInstantPayment(shopID);
            refund = await refundConditions.proceedRefund(payment, refundParams(10000));
            refund.should.have.property('id').to.be.a('string');
            refund.should.have.property('createdAt').to.be.a('Date');
            refund.should.have.property('amount').equal(10000);
            refund.should.have.property('currency').equal('RUB');
            refund.should.have.property('reason').to.be.a('string');
            refund.should.have.property('status').to.equal(RefundStatus.StatusEnum.Succeeded);
            const invoiceEventActions = await InvoicesEventActions.getInstance();
            await invoiceEventActions.waitConditions(
                [isPaymentRefunded(payment.id)],
                payment.invoiceID
            );
        });

        it('should search refunds in anapi', async () => {
            const { result } = await until(() => searchActions.searchRefunds({
                partyID,
                fromTime: moment().subtract(1, 'minutes'),
                toTime: moment(),
                limit: 10,
                shopID,
                paymentInstitutionRealm: 'test',
                invoiceID: payment.invoiceID,
                paymentID: payment.id
            }))
                .satisfy(search => {
                    if (search.result.length < 1) {
                        throw new Error('Search returned 0 refunds');
                    }
                });
            result.length.should.eq(1);
            result[0].should.have.property('invoiceID').equal(payment.invoiceID);
            result[0].should.have.property('paymentID').equal(payment.id);
        });

    });

    it('should create several partial refunds', async () => {
        const payment = await paymentCondition.proceedInstantPayment(shopID, 10000);
        const refund1 = await refundConditions.proceedRefund(payment, refundParams(2000, 'RUB'));
        refund1.should.have.property('amount').equal(2000);
        const refund2 = await refundConditions.proceedRefund(payment, refundParams(8000));
        refund2.should.have.property('amount').equal(8000);
    });

    it('should be idempotent', async () => {
        const payment = await paymentCondition.proceedInstantPayment(shopID);
        let refundParamsExternalId = refundParams(2000, 'RUB', '42');
        let refund1 = await paymentsActions.createRefund(
            payment.invoiceID,
            payment.id,
            refundParamsExternalId
        );
        let refund2 = await paymentsActions.createRefund(
            payment.invoiceID,
            payment.id,
            refundParamsExternalId
        );
        refund1.should.be.deep.eq(refund2);
    });

    it('should fail with different params', async () => {
        const payment = await paymentCondition.proceedInstantPayment(shopID);
        let refund = await paymentsActions.createRefund(
            payment.invoiceID,
            payment.id,
            refundParams(2000, 'RUB', '42')
        );
        let error: AxiosError = await paymentsActions.createRefund(
            payment.invoiceID,
            payment.id,
            refundParams(4000, 'RUB', '42')
        ).should.eventually.rejectedWith(AxiosError);
        error.response.status.should.be.eq(409);
        error.response.data.should.include({
            externalID: '42',
            message: "This 'externalID' has been used by another request"
        });
    });

});
