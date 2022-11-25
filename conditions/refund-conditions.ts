import * as chai from 'chai';
import { Payment, Refund, RefundParams } from '../api/capi-v2/codegen';
import { InvoicesEventActions, isRefundSucceeded, PaymentsActions } from '../actions/capi-v2';
import { AuthActions } from '../actions';

chai.should();

export class RefundConditions {
    private paymentsActions: PaymentsActions;
    private invoiceEventActions: InvoicesEventActions;

    private static instance: RefundConditions;

    static async getInstance(): Promise<RefundConditions> {
        if (this.instance) {
            return this.instance;
        }
        const token = await AuthActions.getInstance().getExternalAccessToken();
        this.instance = new RefundConditions(token);
        return this.instance;
    }

    constructor(token: string) {
        this.paymentsActions = new PaymentsActions(token);
        this.invoiceEventActions = new InvoicesEventActions(token);
    }

    async proceedRefund(payment: Payment, params: RefundParams): Promise<Refund> {
        const refund = await this.paymentsActions.createRefund(payment.invoiceID, payment.id, params);
        await this.invoiceEventActions.waitConditions(
            [isRefundSucceeded(payment.id, refund.id)],
            payment.invoiceID
        );
        return refund;
    }

}
