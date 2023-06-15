import { TokensActions, PaymentsActions, InvoicesActions } from '../actions/capi-v2';
import {
    InvoicesEventActions,
    isInvoicePaid,
    isPaymentCaptured
} from '../actions/capi-v2/invoice-event-actions';
import { AuthActions } from '../actions';
import {
    Invoice,
    Payment,
    PaymentResource
} from '../api/capi-v2/codegen/api';
import { saneVisaPaymentTool } from '../api';

export class PaymentConditions {
    private invoiceActions: InvoicesActions;
    private paymentsActions: PaymentsActions;
    private invoiceEventActions: InvoicesEventActions;
    private static instance: PaymentConditions;

    static async getInstance(): Promise<PaymentConditions> {
        if (this.instance) {
            return this.instance;
        }
        const token = await AuthActions.getInstance().getExternalAccessToken();
        this.instance = new PaymentConditions(token);
        return this.instance;
    }

    constructor(token: string) {
        this.invoiceActions = new InvoicesActions(token);
        this.paymentsActions = new PaymentsActions(token);
        this.invoiceEventActions = new InvoicesEventActions(token);
    }

    async proceedInstantPayment(
        partyID: string,
        shopID: string,
        amount: number = 10000
    ): Promise<Payment> {
        const { invoice, invoiceAccessToken } = await this.invoiceActions.createSimpleInvoice(partyID, shopID, amount);
        const tokensActions = new TokensActions(invoiceAccessToken.payload);
        const paymentResource = await tokensActions.createPaymentResource(saneVisaPaymentTool);
        return this.proceedInstantPaymentExtend(paymentResource, invoice);
    }

    async proceedInstantPaymentExtend(
        paymentResource: PaymentResource,
        invoice: Invoice,
        externalID?: string,
        metadata?: object
    ): Promise<Payment> {
        const payment = await this.paymentsActions.createInstantPayment(
            invoice.id,
            paymentResource,
            externalID,
            metadata
        );
        await this.invoiceEventActions.waitConditions(
            [isInvoicePaid(), isPaymentCaptured(payment.id)],
            invoice.id
        );
        return await this.paymentsActions.getPaymentByID(invoice.id, payment.id);
    }
}
