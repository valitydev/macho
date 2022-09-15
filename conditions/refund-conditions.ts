import * as chai from 'chai';
import { LogicError, Refund, RefundParams } from '../api/capi-v2/codegen';
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

    private constructor(token: string) {
        this.paymentsActions = new PaymentsActions(token);
        this.invoiceEventActions = new InvoicesEventActions(token);
    }
    async provideRefund(invoiceID: string, paymentID: string, params: RefundParams) {
        const refund = await this.paymentsActions.createRefund(invoiceID, paymentID, params);
        refund.should.have.property('amount').to.equal(params.amount);
        await this.invoiceEventActions.waitConditions(
            [isRefundSucceeded(paymentID, refund.id)],
            invoiceID
        );
    }
}
