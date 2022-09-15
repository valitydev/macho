import { TokensActions, PaymentsActions, InvoicesActions } from '../actions/capi-v2';
import {
    InvoicesEventActions,
    isInvoicePaid,
    isPaymentCaptured
} from '../actions/capi-v2/invoice-event-actions';
import { AuthActions } from '../actions';
import { InvoiceAndToken, PaymentResource } from '../api/capi-v2/codegen/api';

export interface InstantPaymentProceedResult {
    invoiceID: string;
    paymentID: string;
}

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

    private constructor(token: string) {
        this.invoiceActions = new InvoicesActions(token);
        this.paymentsActions = new PaymentsActions(token);
        this.invoiceEventActions = new InvoicesEventActions(token);
    }

    async proceedInstantPayment(
        shopID: string,
        amount: number = 10000
    ): Promise<InstantPaymentProceedResult> {
        const invoiceAndToken = await this.invoiceActions.createSimpleInvoice(shopID, amount);
        const invoiceAccessToken = invoiceAndToken.invoiceAccessToken.payload;
        const tokensActions = new TokensActions(invoiceAccessToken);
        const paymentResource = await tokensActions.createSaneVisaPaymentResource();
        return this.proceedInstantPaymentExtend(amount, paymentResource, invoiceAndToken);
    }

    async proceedInstantPaymentExtend(
        amount: number,
        paymentResource: PaymentResource,
        invoiceAndToken: InvoiceAndToken,
        externalID?: string,
        metadata?: object
    ): Promise<InstantPaymentProceedResult> {
        const invoiceID = invoiceAndToken.invoice.id;
        const { id } = await this.paymentsActions.createInstantPayment(
            invoiceID,
            paymentResource,
            amount,
            externalID,
            metadata
        );
        await this.invoiceEventActions.waitConditions(
            [isInvoicePaid(), isPaymentCaptured(id)],
            invoiceID
        );
        return {
            invoiceID,
            paymentID: id
        };
    }
}
