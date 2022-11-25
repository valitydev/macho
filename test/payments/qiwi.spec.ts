import { AuthActions } from '../../actions';
import {
    InvoicesActions,
    InvoicesEventActions,
    isInvoiceInteracted,
    isInvoicePaid,
    isPaymentCaptured,
    PaymentsActions,
    TokensActions
} from '../../actions/capi-v2';
import { ShopConditions } from '../../conditions/shop-conditions';
import { ProxyApiForTests } from '../../api/proxy-api';
import { provideInteract } from '../../utils/provide-interact';
import { PaymentInteractionRequested } from '../../api/capi-v2/codegen';
import { qiwiPaymentTool } from '../../api';

describe('QIWI', () => {
    let invoiceActions: InvoicesActions;
    let invoiceEventActions: InvoicesEventActions;
    let paymentActions: PaymentsActions;
    let proxyApiForTests: ProxyApiForTests;
    let liveShopID: string;

    before(async () => {
        const shopConditions = await ShopConditions.getInstance();
        const [externalAccessToken, liveShop] = await Promise.all([
            AuthActions.getInstance().getExternalAccessToken(),
            shopConditions.createShop()
        ]);
        invoiceActions = new InvoicesActions(externalAccessToken);
        invoiceEventActions = new InvoicesEventActions(externalAccessToken);
        paymentActions = new PaymentsActions(externalAccessToken);
        proxyApiForTests = new ProxyApiForTests(externalAccessToken);
        liveShopID = liveShop.id;
    });

    it('should successfully pay an invoice w/ qiwi wallet', async () => {
        const { invoice, invoiceAccessToken } = await invoiceActions.createSimpleInvoice(liveShopID);
        const tokensActions = new TokensActions(invoiceAccessToken.payload);
        const paymentResource = await tokensActions.createPaymentResource(qiwiPaymentTool);
        const payment = await paymentActions.createInstantPayment(invoice.id, paymentResource);
        const event = await invoiceEventActions.waitConditions([isInvoiceInteracted()], invoice.id);
        await provideInteract(event[0] as PaymentInteractionRequested);
        await invoiceEventActions.waitConditions(
            [isPaymentCaptured(payment.id), isInvoicePaid()],
            invoice.id
        );
    });
});
