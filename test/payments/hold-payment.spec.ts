import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import chaiDateString from 'chai-date-string';
import { ShopConditions } from '../../conditions/shop-conditions';
import { AuthActions, isInvoicePaid, isPaymentCaptured, isPaymentProcessed } from '../../actions';
import {
    InvoicesActions,
    InvoicesEventActions,
    PaymentsActions,
    TokensActions
} from '../../actions/capi-v2';
import {
    PaymentFlow,
    PaymentFlowHold,
    PaymentStatus,
    saneVisaPaymentTool
} from '../../api';

chai.should();
chai.use(chaiAsPromised);
chai.use(chaiDateString);

import PaymentStatusT = PaymentStatus.StatusEnum;
import FlowT = PaymentFlow.TypeEnum;
import FlowHoldT = PaymentFlowHold.OnHoldExpirationEnum;
import { AxiosError } from 'axios';

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
        const { invoice, invoiceAccessToken }  = await invoiceActions.createSimpleInvoice(liveShopID);
        const tokensActions = new TokensActions(invoiceAccessToken.payload);
        const paymentResource = await tokensActions.createPaymentResource(saneVisaPaymentTool);
        const payment = await paymentsActions.createHoldPayment(
            invoice.id,
            paymentResource,
            FlowHoldT.Capture
        );
        payment.should.have.property('id').to.be.a('string');
        payment.should.have.property('invoiceID').equal(invoice.id);
        payment.flow.should.include({
            type: FlowT.PaymentFlowHold,
            onHoldExpiration: FlowHoldT.Capture
        } as PaymentFlowHold);
        // @ts-ignore
        payment.flow.should.have.property('heldUntil').that.is.a.dateString();
        await invoiceEventActions.waitConditions(
            [isPaymentCaptured(payment.id), isInvoicePaid()],
            invoice.id
        );
    });

    it('Manual captured payment', async () => {
        const amount = 1001;
        const { invoice, invoiceAccessToken } = await invoiceActions.createSimpleInvoice(liveShopID, amount);
        const tokensActions = new TokensActions(invoiceAccessToken.payload);
        const paymentResource = await tokensActions.createPaymentResource(saneVisaPaymentTool);
        const payment = await paymentsActions.createHoldPayment(
            invoice.id,
            paymentResource,
            FlowHoldT.Cancel
        );
        payment.should.have.property('id').to.be.a('string');
        payment.should.have.property('invoiceID').equal(invoice.id);
        payment.should.have.property('amount').equal(amount);
        payment.flow.should.include({
            type: FlowT.PaymentFlowHold,
            onHoldExpiration: FlowHoldT.Cancel
        } as PaymentFlowHold);
        await invoiceEventActions.waitConditions(
            [isPaymentProcessed(payment.id)],
            invoice.id
        );
        await paymentsActions.capturePayment(invoice.id, payment.id);
        await invoiceEventActions.waitConditions(
            [isPaymentCaptured(payment.id), isInvoicePaid()],
            invoice.id
        );
        const capturedPayment = await paymentsActions.getPaymentByID(invoice.id, payment.id);
        capturedPayment.should.include({
            status: PaymentStatusT.Captured
        });
    });

    it('Manual partial captured payment', async () => {
        const { invoice, invoiceAccessToken } = await invoiceActions.createSimpleInvoice(liveShopID, 10000);
        const tokensActions = new TokensActions(invoiceAccessToken.payload);
        const paymentResource = await tokensActions.createPaymentResource(saneVisaPaymentTool);
        const payment = await paymentsActions.createHoldPayment(
            invoice.id,
            paymentResource,
            FlowHoldT.Cancel
        );
        await invoiceEventActions.waitConditions(
            [isPaymentProcessed(payment.id)],
            invoice.id
        );
        await paymentsActions.capturePayment(invoice.id, payment.id, 5000);
        await invoiceEventActions.waitConditions(
            [isPaymentCaptured(payment.id), isInvoicePaid()],
            invoice.id
        );
        const capturedPayment = await paymentsActions.getPaymentByID(invoice.id, payment.id);
        capturedPayment.should.include({
            status: PaymentStatusT.Captured,
            amount: 5000
        });
    });

    it('Failed manual partial capture payment', async () => {
        const { invoice, invoiceAccessToken } = await invoiceActions.createSimpleInvoice(liveShopID);
        const tokensActions = new TokensActions(invoiceAccessToken.payload);
        const paymentResource = await tokensActions.createPaymentResource(saneVisaPaymentTool);
        const payment = await paymentsActions.createHoldPayment(
            invoice.id,
            paymentResource,
            FlowHoldT.Cancel
        );
        await invoiceEventActions.waitConditions(
            [isPaymentProcessed(payment.id)],
            invoice.id
        );
        const e: AxiosError =
            await paymentsActions.capturePayment(invoice.id, payment.id, 12000) // default amount = 10000
                .should.eventually.be.rejectedWith(AxiosError);
        e.response.data.should.have.property('code').equal('amountExceededCaptureBalance');
    });
});
