import * as chai from 'chai';
import {
    captureParams,
    Payment,
    PaymentFlow,
    paymentParams,
    PaymentRecurrentParent,
    PaymentResource,
    paymentResourcePayer,
    PaymentsApiFp,
    recurrentPayer,
    LogicError,
    Refund,
    RefundParams,
    SearchApiFp
} from '../../api/capi-v2';
import { assertPayment } from '../../api/capi-v2/params';
import { CAPIDispatcher } from '../../utils/codegen-utils';
import delay from '../../utils/delay';
import moment = require('moment');

chai.should();

export class PaymentsActions {
    private api;
    private searchApi;
    private dispatcher: CAPIDispatcher;

    constructor(accessToken: string) {
        this.dispatcher = new CAPIDispatcher({});
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
        amount = 10000,
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
        return this.dispatcher
            .callMethod(this.api.createPayment, invoiceID, params)
            .then(payment => {
                assertPayment(
                    payment,
                    amount,
                    PaymentFlow.TypeEnum.PaymentFlowInstant,
                    undefined,
                    metadata
                );
                return payment;
            });
    }

    createHoldPayment(
        invoiceID: string,
        paymentResource: PaymentResource,
        holdType?: string,
        amount = 10000
    ): Promise<Payment> {
        const payer = paymentResourcePayer(paymentResource);
        const params = paymentParams(payer, PaymentFlow.TypeEnum.PaymentFlowHold, false, holdType);
        return this.dispatcher
            .callMethod(this.api.createPayment, invoiceID, params)
            .then(payment => {
                assertPayment(payment, amount, PaymentFlow.TypeEnum.PaymentFlowHold, holdType);
                return payment;
            });
    }

    createFirstRecurrentPayment(
        invoiceID: string,
        paymentResource: PaymentResource
    ): Promise<Payment> {
        const payer = paymentResourcePayer(paymentResource);
        const params = paymentParams(payer, PaymentFlow.TypeEnum.PaymentFlowInstant, true);
        return this.dispatcher
            .callMethod(this.api.createPayment, invoiceID, params)
            .then(payment => {
                assertPayment(payment, 10000, PaymentFlow.TypeEnum.PaymentFlowInstant);
                return payment;
            });
    }

    createRecurrentPayment(invoiceID: string, parent: PaymentRecurrentParent): Promise<Payment> {
        const payer = recurrentPayer(parent);
        const params = paymentParams(payer, PaymentFlow.TypeEnum.PaymentFlowInstant, true);
        return this.dispatcher
            .callMethod(this.api.createPayment, invoiceID, params)
            .then(payment => {
                assertPayment(payment, 10000, PaymentFlow.TypeEnum.PaymentFlowInstant);
                return payment;
            });
    }

    createRefund(
        invoiceID: string,
        paymentID: string,
        refundParams: RefundParams
    ): Promise<Refund> {
        return this.dispatcher
            .callMethod(this.api.createRefund, invoiceID, paymentID, refundParams)
            .then(refund => {
                refund.should.to.have.property('id').to.be.a('string');
                refund.should.to.have.property('createdAt').to.be.a('string');
                refund.should.to.have.property('amount').to.be.a('number');
                refund.should.to.have.property('currency').to.be.a('string');
                refund.should.to.have.property('reason').to.be.a('string');
                refund.should.to.have.property('status').to.equal('pending');
                return refund;
            });
    }

    createRefundError(
        invoiceID: string,
        paymentID: string,
        refundParams: RefundParams
    ): Promise<LogicError> {
        return this.dispatcher
            .callMethod(this.api.createRefund, invoiceID, paymentID, refundParams)
            .catch(error => {
                return error;
            });
    }

    getPaymentByID(
        invoiceID: string,
        paymentID: string,
        paymentType: PaymentFlow.TypeEnum
    ): Promise<Payment> {
        return this.dispatcher
            .callMethod(this.api.getPaymentByID, invoiceID, paymentID)
            .then(payment => {
                assertPayment(payment, 10000, paymentType);
                return payment;
            });
    }

    capturePayment(invoiceID: string, paymentID: string, amount?: number): Promise<Response> {
        const params = captureParams(amount);
        return this.dispatcher
            .callMethod(this.api.capturePayment, invoiceID, paymentID, params)
            .then(resp => {
                return resp;
            });
    }

    async searchPayments(shopID: string) {
        return await this.dispatcher.callMethod(
            this.searchApi.searchPayments,
            shopID,
            moment().add(-1, 'minutes'),
            moment(),
            1000,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined
        );
    }

    async waitPayment(paymentID: string, shopID: string) {
        const result = await Promise.race([this.pollPayment(paymentID, shopID), delay(25000)]);
        if (result) {
            return result;
        }
        throw new Error(`payments event polling timeout`);
    }

    private async pollPayment(paymentID: string, shopID: string) {
        let paymentFound = false;
        while (!paymentFound) {
            await delay(2000);
            const payments = (await this.searchPayments(shopID)).result;
            const foundPayments = payments.filter(payment => payment.id === paymentID);
            paymentFound =
                payments.length > 0 &&
                foundPayments.length > 0 &&
                foundPayments[0].status === 'captured';
        }
        return paymentFound;
    }
}
