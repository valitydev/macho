import { ShopConditions } from '../../conditions/shop-conditions';
import { AuthActions, isInvoicePaid, isPaymentCaptured } from '../../actions';
import {
    InvoicesActions,
    InvoicesEventActions,
    PaymentsActions,
    TokensActions,
    PartiesActions
} from '../../actions/capi-v2';
import {
    PaymentRecurrentParent,
    RecurrentPayer,
    saneVisaPaymentTool
} from '../../api/capi-v2';

describe('Direct recurrent payments', () => {
    let paymentsActions: PaymentsActions;
    let invoiceActions: InvoicesActions;
    let invoiceEventActions: InvoicesEventActions;
    let liveShopID: string;
    let partyID: string;

    before(async () => {
        const shopConditions = await ShopConditions.getInstance();
        const authActions = AuthActions.getInstance();
        const [externalAccessToken, shop] = await Promise.all([
            authActions.getExternalAccessToken(),
            shopConditions.createShop()
        ]);
        invoiceActions = new InvoicesActions(externalAccessToken);
        invoiceEventActions = new InvoicesEventActions(externalAccessToken);
        paymentsActions = new PaymentsActions(externalAccessToken);
        liveShopID = shop.id;
        const partiesActions = new PartiesActions(externalAccessToken);
        const party = await partiesActions.getActiveParty();
        partyID = party.id;
    });

    it('Create and proceed first payment', async () => {
        const { invoice, invoiceAccessToken } = await invoiceActions.createSimpleInvoice(partyID, liveShopID, 10000);
        const tokensActions = new TokensActions(invoiceAccessToken.payload);
        const paymentResource = await tokensActions.createPaymentResource(saneVisaPaymentTool);
        const payment = await paymentsActions.createFirstRecurrentPayment(invoice.id, paymentResource);
        payment.should.have.property('id').to.be.a('string');
        payment.should.have.property('invoiceID').equal(invoice.id);
        payment.should.have.property('amount').equal(10000);
        payment.should.have.property('currency').equal('RUB');
        payment.should.have.property('makeRecurrent').equal(true);
        await invoiceEventActions.waitConditions(
            [isPaymentCaptured(payment.id), isInvoicePaid()],
            invoice.id
        );
    });

    it('Create and proceed two payments', async () => {
        const {
            invoice: invoice1,
            invoiceAccessToken: invoiceAccessToken1
        } = await invoiceActions.createSimpleInvoice(partyID, liveShopID);
        const tokensActions = new TokensActions(invoiceAccessToken1.payload);
        const paymentResource = await tokensActions.createPaymentResource(saneVisaPaymentTool);
        const payment1 = await paymentsActions.createFirstRecurrentPayment(invoice1.id, paymentResource);
        await invoiceEventActions.waitConditions(
            [isPaymentCaptured(payment1.id), isInvoicePaid()],
            invoice1.id
        );
        payment1.should.have.property('id').to.be.a('string');
        payment1.should.have.property('invoiceID').equal(invoice1.id);
        payment1.should.have.property('makeRecurrent').equal(true);
        const { invoice: invoice2 } = await invoiceActions.createSimpleInvoice(partyID, liveShopID);
        const parent: PaymentRecurrentParent = {
            paymentID: payment1.id,
            invoiceID: invoice1.id
        };
        const payment2 = await paymentsActions.createRecurrentPayment(invoice2.id, parent);
        payment2.should.have.property('id').to.be.a('string');
        payment2.should.have.property('invoiceID').equal(invoice2.id);
        payment2.should.have.property('makeRecurrent').equal(true);
        payment2.should.have.property('payer').to.be.an('object');
        const payer2 = payment2.payer as RecurrentPayer;
        payer2.should.have.property('recurrentParentPayment').to.be.an('object');
        payer2.recurrentParentPayment.should.have.property('invoiceID').equal(invoice1.id);
        payer2.recurrentParentPayment.should.have.property('paymentID').equal(payment1.id);
        payer2.should.have.property('paymentToolDetails')
            .that.includes({
                detailsType: 'PaymentToolDetailsBankCard',
                cardNumberMask: '424242******4242',
                paymentSystem: 'VISA'    
            });
        payer2.should.to.deep.include({
            contactInfo: {
                email: 'user@example.com'
            }
        });
        await invoiceEventActions.waitConditions(
            [isPaymentCaptured(payment2.id), isInvoicePaid()],
            invoice2.id
        );
    });
});
