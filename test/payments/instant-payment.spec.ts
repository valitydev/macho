import moment from 'moment';
import chai from 'chai';
import chaiDateString from 'chai-date-string';
import { ShopConditions, PaymentConditions } from '../../conditions';
import { AuthActions, AnapiSearchActions } from '../../actions';
import {
    InvoicesActions,
    InvoicesEventActions,
    isInvoiceInteracted,
    isInvoicePaid,
    isPaymentCaptured,
    isPaymentFailed,
    PaymentsActions,
    TokensActions,
    PartiesActions
} from '../../actions/capi-v2';
import { provideInteract } from '../../utils/provide-interact';
import {
    PaymentFlow,
    PaymentStatus,
    PaymentInteractionRequested,
    saneVisaPaymentTool,
    secureVisaPaymentTool,
    secureEmptyCVVVisaPaymentTool,
    insufficientFundsVisaTool,
    PaymentResourcePayer
} from '../../api/capi-v2';
import guid from '../../utils/guid';
import until from '../../utils/until';

chai.should();
chai.use(chaiDateString);

describe('Instant payments', () => {
    let paymentsActions: PaymentsActions;
    let paymentConditions: PaymentConditions;
    let invoiceActions: InvoicesActions;
    let invoiceEventActions: InvoicesEventActions;
    let searchActions: AnapiSearchActions;
    let liveShopID: string;
    let partyID: string;

    before(async () => {
        const shopConditions = await ShopConditions.getInstance();
        const authActions = AuthActions.getInstance();
        const [externalAccessToken, shop] = await Promise.all([
            authActions.getExternalAccessToken(),
            shopConditions.createShop()
        ]);
        paymentsActions = new PaymentsActions(externalAccessToken);
        paymentConditions = new PaymentConditions(externalAccessToken);
        invoiceActions = new InvoicesActions(externalAccessToken);
        invoiceEventActions = new InvoicesEventActions(externalAccessToken);
        searchActions = new AnapiSearchActions(externalAccessToken);
        liveShopID = shop.id;
        const partiesActions = new PartiesActions(externalAccessToken);
        const party = await partiesActions.getActiveParty();
        partyID = party.id;
    });

    describe('Sane payment and search', async () => {
        let paymentID: string;
        let invoiceID: string;
        let paymentMetadata: Record<string, any>;

        it('should create and proceed payment', async () => {
            const amount = 1000;
            const metadata = { hey: 'there', im: [1, 3, 3, 7] };
            const { invoice, invoiceAccessToken } = await invoiceActions.createSimpleInvoice(partyID, liveShopID, amount);
            const tokensActions = new TokensActions(invoiceAccessToken.payload);
            const paymentResource = await tokensActions.createPaymentResource(saneVisaPaymentTool);
            const payment = await paymentConditions.proceedInstantPaymentExtend(
                paymentResource,
                invoice,
                undefined,
                metadata
            );
            payment.should.have.property('id').to.be.a('string');
            payment.should.have.property('invoiceID').equal(invoice.id);
            // @ts-ignore
            payment.should.have.property('createdAt').to.be.a.dateString();
            payment.should.have.property('status').equal(PaymentStatus.StatusEnum.Captured);
            payment.should.have.property('amount').equal(amount);
            payment.should.have.property('currency').equal('RUB');
            payment.should.have.deep.property('metadata', metadata);
            payment.flow.should.include({type: PaymentFlow.TypeEnum.PaymentFlowInstant});
            payment.should.have.property('makeRecurrent').to.be.a('boolean');
            payment.should.have.property('payer').to.be.an('object');
            payment.payer.should.have.property('paymentToolDetails').to.be.an('object');
            payment.payer.should.have.property('paymentToolDetails').that.includes({
                detailsType: 'PaymentToolDetailsBankCard',
                cardNumberMask: '424242******4242',
                paymentSystem: 'VISA'
            });
            payment.payer.should.have.property('clientInfo').to.be.an('object');
            payment.payer.should.deep.include({
                contactInfo: { email: 'user@example.com' }
            });
            invoiceID = invoice.id;
            paymentID = payment.id;
            paymentMetadata = metadata;
        });

        it('should find created payment', async () => {
            const { result } =
                await until(() => searchActions.searchPayments({
                    partyID,
                    fromTime: moment().subtract(1, 'minutes'),
                    toTime: moment(),
                    limit: 10,
                    paymentInstitutionRealm: 'test',
                    shopID: liveShopID,
                    invoiceID,
                    paymentID
                }))
                    .satisfy(search => {
                        if (search.result.length < 1) {
                            throw new Error('Search returned 0 payments');
                        }
                    });
            result.length.should.eq(1);
            result[0].id.should.eq(paymentID);
            result[0].invoiceID.should.eq(invoiceID);
            result[0].metadata.should.eql(paymentMetadata);
        });

    });

    it('should create payment idempotently', async () => {
        const amount = 1000;
        let promises = [];
        let tries = 10;
        const externalID = guid();
        const { invoice, invoiceAccessToken } = await invoiceActions.createSimpleInvoice(partyID, liveShopID, amount);
        const tokensActions = new TokensActions(invoiceAccessToken.payload);
        const paymentResource = await tokensActions.createPaymentResource(saneVisaPaymentTool);
        while (tries > 0) {
            const promise = paymentsActions.createInstantPayment(
                invoice.id,
                paymentResource,
                externalID
            );
            promises.push(promise);
            tries--;
        }
        const payments = await Promise.all(promises);
        const paymentID = payments[0].id;
        for (let payment of payments) {
            invoice.id.should.eq(payment.invoiceID);
            paymentID.should.eq(payment.id);
        }
    });

    it('should create and proceed payment with 3DS', async () => {
        const { invoice, invoiceAccessToken } = await invoiceActions.createSimpleInvoice(partyID, liveShopID);
        const tokensActions = new TokensActions(invoiceAccessToken.payload);
        const paymentResource = await tokensActions.createPaymentResource(secureVisaPaymentTool);
        const payment = await paymentsActions.createInstantPayment(invoice.id, paymentResource);
        const change = await invoiceEventActions.waitConditions([isInvoiceInteracted()], invoice.id);
        payment.should.have.property('id').to.be.a('string');
        payment.should.have.property('invoiceID').equal(invoice.id);
        payment.should.have.property('status').equal(PaymentStatus.StatusEnum.Pending);
    await provideInteract(change[0] as PaymentInteractionRequested);
        await invoiceEventActions.waitConditions(
            [isInvoicePaid(), isPaymentCaptured(payment.id)],
            invoice.id
        );
    });

    it('should create and proceed payment with 3DS + empty cvv', async () => {
        const { invoice, invoiceAccessToken } = await invoiceActions.createSimpleInvoice(partyID, liveShopID);
        const tokensActions = new TokensActions(invoiceAccessToken.payload);
        const paymentResource = await tokensActions.createPaymentResource(secureEmptyCVVVisaPaymentTool);
        const payment = await paymentsActions.createInstantPayment(invoice.id, paymentResource);
        const change = await invoiceEventActions.waitConditions([isInvoiceInteracted()], invoice.id);
        payment.should.have.property('id').to.be.a('string');
        payment.should.have.property('invoiceID').equal(invoice.id);
        payment.should.have.property('status').equal(PaymentStatus.StatusEnum.Pending);
        await provideInteract(change[0] as PaymentInteractionRequested);
        await invoiceEventActions.waitConditions(
            [isInvoicePaid(), isPaymentCaptured(payment.id)],
            invoice.id
        );
    });

    it('payment with invalid card should fail', async () => {
        const { invoice, invoiceAccessToken } = await invoiceActions.createSimpleInvoice(partyID, liveShopID);
        const tokensActions = new TokensActions(invoiceAccessToken.payload);
        const paymentResource = await tokensActions.createPaymentResource(insufficientFundsVisaTool);
        const payment = await paymentsActions.createInstantPayment(invoice.id, paymentResource);
        await invoiceEventActions.waitConditions([isPaymentFailed(payment.id)], invoice.id);
    });
});
