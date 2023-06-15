import * as chai from 'chai';
import {
    captureParams,
    Payment,
    PaymentFlow,
    PaymentFlowHold,
    paymentParams,
    PaymentRecurrentParent,
    PaymentResource,
    paymentResourcePayer,
    PaymentsApiFp,
    recurrentPayer,
    Refund,
    RefundParams,
    SearchApiFp
} from '../../api/capi-v2';
import { CAPIDispatcher } from '../../utils/codegen-utils';
import moment from 'moment';

chai.should();

export class PaymentsActions {
    private api;
    private searchApi;
    private dispatcher: CAPIDispatcher;

    constructor(accessToken: string) {
        this.dispatcher = new CAPIDispatcher({
            headers: {
                origin: 'https://dashboard.stage.empayre.com'
            }
        });
        this.api = PaymentsApiFp({
            apiKey: `Bearer ${accessToken}`
        });
        this.searchApi = SearchApiFp({
            apiKey: `Bearer ${accessToken}`
        });
    }

    createInstantPayment(
        invoiceID: string,
        paymentResource: PaymentResource,
        externalID?: string,
        metadata?: object
    ): Promise<Payment> {
        const payer = paymentResourcePayer(paymentResource);
        let params = paymentParams(
            payer,
            PaymentFlow.TypeEnum.PaymentFlowInstant,
            false,
            undefined,
            externalID,
            metadata
        );
        return this.dispatcher.callMethod(this.api.createPayment, invoiceID, params);
    }

    createHoldPayment(
        invoiceID: string,
        paymentResource: PaymentResource,
        holdType?: PaymentFlowHold.OnHoldExpirationEnum
    ): Promise<Payment> {
        const payer = paymentResourcePayer(paymentResource);
        const params = paymentParams(payer, PaymentFlow.TypeEnum.PaymentFlowHold, false, holdType);
        return this.dispatcher.callMethod(this.api.createPayment, invoiceID, params);
    }

    createFirstRecurrentPayment(
        invoiceID: string,
        paymentResource: PaymentResource
    ): Promise<Payment> {
        const payer = paymentResourcePayer(paymentResource);
        const params = paymentParams(payer, PaymentFlow.TypeEnum.PaymentFlowInstant, true);
        return this.dispatcher.callMethod(this.api.createPayment, invoiceID, params);
    }

    createRecurrentPayment(invoiceID: string, parent: PaymentRecurrentParent): Promise<Payment> {
        const payer = recurrentPayer(parent);
        const params = paymentParams(payer, PaymentFlow.TypeEnum.PaymentFlowInstant, true);
        return this.dispatcher.callMethod(this.api.createPayment, invoiceID, params);
    }

    createRefund(
        invoiceID: string,
        paymentID: string,
        refundParams: RefundParams
    ): Promise<Refund> {
        return this.dispatcher
            .callMethod(this.api.createRefund, invoiceID, paymentID, refundParams);
    }

    getPaymentByID(
        invoiceID: string,
        paymentID: string
    ): Promise<Payment> {
        return this.dispatcher
            .callMethod(this.api.getPaymentByID, invoiceID, paymentID);
    }

    capturePayment(invoiceID: string, paymentID: string, amount?: number): Promise<Response> {
        const params = captureParams(amount);
        return this.dispatcher
            .callMethod(this.api.capturePayment, invoiceID, paymentID, params);
    }

    getRefundByID(
        invoiceID: string,
        paymentID: string,
        refundID: string
    ): Promise<Refund> {
        return this.dispatcher
            .callMethod(this.api.getRefundByID, invoiceID, paymentID, refundID);
    }

    async searchPayments(shopID: string, paymentID?: string) {
        return await this.dispatcher.callMethod(
            this.searchApi.searchPayments,
            shopID,                          // {string} shopID       
            moment().subtract(1, 'minutes'), // {Date} fromTime 
            moment(),                        // {Date} toTime 
            1000,                            // {number} limit 
            undefined,                       // {string} [xRequestDeadline]
            undefined,                       // {string} [paymentStatus]
            undefined,                       // {string} [paymentFlow]
            undefined,                       // {string} [paymentMethod]
            undefined,                       // {string} [paymentTerminalProvider]
            undefined,                       // {string} [invoiceID]
            paymentID,                       // {string} [paymentID]
            undefined,                       // {string} [payerEmail]
            undefined,                       // {string} [payerIP]
            undefined,                       // {string} [payerFingerprint]
            undefined,                       // {string} [customerID]
            undefined,                       // {string} [first6]
            undefined,                       // {string} [last4]
            undefined,                       // {string} [rrn]
            undefined,                       // {string} [approvalCode]
            undefined,                       // {string} [bankCardTokenProvider]
            undefined,                       // {string} [bankCardPaymentSystem]
            undefined,                       // {number} [paymentAmount]
            undefined                        // {string} [continuationToken]
        );
    }

}
