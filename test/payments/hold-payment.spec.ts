import { ShopConditions } from '../../conditions/shop-conditions';
import { AuthActions, isInvoicePaid, isPaymentCaptured, isPaymentProcessed } from '../../actions';
import {
    InvoicesActions,
    InvoicesEventActions,
    PaymentsActions,
    TokensActions
} from '../../actions/capi-v2';

describe('Hold payments', () => {
    let paymentsActions: PaymentsActions;
    let invoiceActions: InvoicesActions;
    let invoiceEventActions: InvoicesEventActions;
    let liveShopID: string;

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
    });

    it('Auto captured payment', async () => {
        const invoiceAndToken = await invoiceActions.createSimpleInvoice(liveShopID);
        const invoiceAccessToken = invoiceAndToken.invoiceAccessToken.payload;
        const tokensActions = new TokensActions(invoiceAccessToken);
        const paymentResource = await tokensActions.createSaneVisaPaymentResource();
        const payment = await paymentsActions.createHoldPayment(
            invoiceAndToken.invoice.id,
            paymentResource
        );
        await invoiceEventActions.waitConditions(
            [isPaymentCaptured(payment.id), isInvoicePaid()],
            invoiceAndToken.invoice.id
        );
    });

    it('Manual captured payment', async () => {
        const amount = 1001;
        const invoiceAndToken = await invoiceActions.createSimpleInvoice(liveShopID, amount);
        const invoiceAccessToken = invoiceAndToken.invoiceAccessToken.payload;
        const tokensActions = new TokensActions(invoiceAccessToken);
        const paymentResource = await tokensActions.createSaneVisaPaymentResource();
        const payment = await paymentsActions.createHoldPayment(
            invoiceAndToken.invoice.id,
            paymentResource,
            'cancel',
            amount
        );
        await invoiceEventActions.waitConditions(
            [isPaymentProcessed(payment.id)],
            invoiceAndToken.invoice.id
        );
        await paymentsActions.capturePayment(invoiceAndToken.invoice.id, payment.id);
        await invoiceEventActions.waitConditions(
            [isPaymentCaptured(payment.id), isInvoicePaid()],
            invoiceAndToken.invoice.id
        );
    });

    it('Manual partial captured payment', async () => {
        const invoiceAndToken = await invoiceActions.createSimpleInvoice(liveShopID);
        const invoiceAccessToken = invoiceAndToken.invoiceAccessToken.payload;
        const tokensActions = new TokensActions(invoiceAccessToken);
        const paymentResource = await tokensActions.createSaneVisaPaymentResource();
        const payment = await paymentsActions.createHoldPayment(
            invoiceAndToken.invoice.id,
            paymentResource,
            'cancel'
        );
        await invoiceEventActions.waitConditions(
            [isPaymentProcessed(payment.id)],
            invoiceAndToken.invoice.id
        );
        await paymentsActions.capturePayment(invoiceAndToken.invoice.id, payment.id, 5000);
        await invoiceEventActions.waitConditions(
            [isPaymentCaptured(payment.id), isInvoicePaid()],
            invoiceAndToken.invoice.id
        );
    });

    it('Failed manual partial capture payment', async () => {
        const invoiceAndToken = await invoiceActions.createSimpleInvoice(liveShopID);
        const invoiceAccessToken = invoiceAndToken.invoiceAccessToken.payload;
        const tokensActions = new TokensActions(invoiceAccessToken);
        const paymentResource = await tokensActions.createSaneVisaPaymentResource();
        const payment = await paymentsActions.createHoldPayment(
            invoiceAndToken.invoice.id,
            paymentResource,
            'cancel'
        );
        await invoiceEventActions.waitConditions(
            [isPaymentProcessed(payment.id)],
            invoiceAndToken.invoice.id
        );
        try {
            await paymentsActions.capturePayment(invoiceAndToken.invoice.id, payment.id, 12000); // default amount = 10000
        } catch (e) {
            e.message.should.to.have.property('code').to.eq('amountExceededCaptureBalance');
        }
    });
});
