import chai from 'chai';
import { PaymentConditions, RefundConditions, ShopConditions } from '../../conditions';
import delay from '../../utils/delay';
import { WebhooksActions } from '../../actions/capi-v2/webhooks-actions';
import { AuthActions, PartiesActions } from '../../actions';
import { InvoicesTopic } from '../../api/capi-v2/codegen';
import { refundParams } from '../../api/capi-v2/params';

interface Invoice {
    id: string;
    currency: string;
}

interface Payment {
    id: string;
    paymentToolToken: string;
}

interface Refund {
    id: string;
    reason: string;
}

interface Event {
    eventType: string;
    invoice: Invoice;
    payment: Payment;
    refund: Refund;
}

describe('Hooks', () => {
    let paymentCondition: PaymentConditions;
    let refundConditions: RefundConditions;
    let webhooksActions: WebhooksActions;
    let liveShopID: string;
    let partyID: string;
    let liveInvoiceID: string;
    let livePaymentID: string;

    before(async () => {
        const shopConditions = await ShopConditions.getInstance();
        const authActions = AuthActions.getInstance();
        const [externalAccessToken, shop] = await Promise.all([
            authActions.getExternalAccessToken(),
            shopConditions.createShop()
        ]);
        paymentCondition = await PaymentConditions.getInstance();
        refundConditions = await RefundConditions.getInstance();
        webhooksActions = await WebhooksActions.getInstance();
        liveShopID = shop.id;
        const partiesActions = new PartiesActions(externalAccessToken);
        const party = await partiesActions.getActiveParty();
        partyID = party.id;
    });

    describe('Webhook creation and receipt validation', async () => {
        it('Create hook', async () => {
            await webhooksActions.createWebhook(
                liveShopID,
                liveShopID,
                partyID,
                Array.of(
                    InvoicesTopic.EventTypesEnum.InvoiceCreated,
                    InvoicesTopic.EventTypesEnum.InvoicePaid,
                    InvoicesTopic.EventTypesEnum.InvoiceCancelled,
                    InvoicesTopic.EventTypesEnum.InvoiceFulfilled,
                    InvoicesTopic.EventTypesEnum.PaymentStarted,
                    InvoicesTopic.EventTypesEnum.PaymentCancelled,
                    InvoicesTopic.EventTypesEnum.PaymentCaptured,
                    InvoicesTopic.EventTypesEnum.PaymentFailed,
                    InvoicesTopic.EventTypesEnum.PaymentProcessed,
                    InvoicesTopic.EventTypesEnum.PaymentRefundCreated,
                    InvoicesTopic.EventTypesEnum.PaymentRefundSucceeded,
                    InvoicesTopic.EventTypesEnum.PaymentRefundFailed
                )
            );
        });

        it('Should create and send webhook on full cycle of payment', async () => {
            const amount = 10000;
            const payment = await paymentCondition.proceedInstantPayment(partyID, liveShopID, amount);
            await refundConditions.proceedRefund(payment, refundParams(8000));
            liveInvoiceID = payment.invoiceID;
            livePaymentID = payment.id;
        });

        // it('Should have hooks', async () => {
        //     await delay(5000);
        //     const result = await Promise.race([delay(20000), countHooks()]);
        //     chai.expect(result).to.eq(7);
        // });

        // it('Should check hooks structure', async () => {
        //     let body = await webhooksActions.getEvents(liveShopID);
        //     let events: Event[] = JSON.parse(body);
        //     for (let e of events) {
        //         e.invoice.should.not.be.null;
        //         liveInvoiceID.should.eq(e.invoice.id);
        //         e.invoice.currency.should.not.be.null;
        //         if (e.eventType === 'InvoiceCreated' || e.eventType === 'InvoicePaid') {
        //             chai.expect(e.payment).to.be.undefined;
        //             chai.expect(e.refund).to.be.undefined;
        //         } else if (
        //             e.eventType === 'PaymentStarted' ||
        //             e.eventType === 'PaymentProcessed' ||
        //             e.eventType === 'PaymentCaptured'
        //         ) {
        //             e.payment.should.not.be.null;
        //             livePaymentID.should.be.eq(e.payment.id);
        //             e.payment.paymentToolToken.should.not.be.null;
        //             chai.expect(e.refund).to.be.undefined;
        //         } else if (e.eventType === 'RefundCreated' || e.eventType === 'RefundSucceeded') {
        //             e.payment.should.not.be.undefined;
        //             e.refund.should.not.be.undefined;
        //             e.refund.id.should.not.be.null;
        //             e.refund.reason.should.not.be.null;
        //         } else {
        //             chai.expect.fail();
        //         }
        //     }
        // });
    });

    async function countHooks(): Promise<number> {
        let result = -1;
        while (result === -1) {
            result = await webhooksActions.countEvents(liveShopID);
            await delay(500);
        }
        return result;
    }
});
