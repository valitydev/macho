import { ShopConditions } from '../../conditions/shop-conditions';
import { AuthActions, isInvoicePaid, isPaymentCaptured } from '../../actions';
import {
    InvoicesActions,
    InvoicesEventActions,
    PaymentsActions,
    TokensActions
} from '../../actions/capi-v2';
import { PaymentRecurrentParent } from '../../api/capi-v2';

describe('Direct recurrent payments', () => {
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

    it('Create and proceed first payment', async () => {
        const invoiceAndToken = await invoiceActions.createSimpleInvoice(liveShopID);
        const invoiceAccessToken = invoiceAndToken.invoiceAccessToken.payload;
        const tokensActions = new TokensActions(invoiceAccessToken);
        const paymentResource = await tokensActions.createSaneVisaPaymentResource();
        const payment = await paymentsActions.createFirstRecurrentPayment(
            invoiceAndToken.invoice.id,
            paymentResource
        );
        await invoiceEventActions.waitConditions(
            [isPaymentCaptured(payment.id), isInvoicePaid()],
            invoiceAndToken.invoice.id
        );
    });

    it('Create and proceed two payments', async () => {
        const firstInvoiceAndToken = await invoiceActions.createSimpleInvoice(liveShopID);
        const firstInvoiceID = firstInvoiceAndToken.invoice.id;
        const firstInvoiceAccessToken = firstInvoiceAndToken.invoiceAccessToken.payload;
        const tokensActions = new TokensActions(firstInvoiceAccessToken);
        const paymentResource = await tokensActions.createSaneVisaPaymentResource();
        const firstPayment = await paymentsActions.createFirstRecurrentPayment(
            firstInvoiceID,
            paymentResource
        );
        await invoiceEventActions.waitConditions(
            [isPaymentCaptured(firstPayment.id), isInvoicePaid()],
            firstInvoiceID
        );
        const secondInvoiceAndToken = await invoiceActions.createSimpleInvoice(liveShopID);
        const secondInvoiceID = secondInvoiceAndToken.invoice.id;
        const parent: PaymentRecurrentParent = {
            paymentID: firstPayment.id,
            invoiceID: firstInvoiceID
        };
        const secondPayment = await paymentsActions.createRecurrentPayment(secondInvoiceID, parent);
        await invoiceEventActions.waitConditions(
            [isPaymentCaptured(secondPayment.id), isInvoicePaid()],
            secondInvoiceID
        );
    });
});
