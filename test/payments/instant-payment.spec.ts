import * as moment from 'moment';
import { ShopConditions, PaymentConditions } from '../../conditions';
import { AnapiSearchActions, AuthActions } from '../../actions';
import {
    InvoicesActions,
    InvoicesEventActions,
    isInvoiceInteracted,
    isInvoicePaid,
    isPaymentCaptured,
    isPaymentFailed,
    PaymentsActions,
    TokensActions,
    PartiesActions
} from '../../actions/capi-v2';
import { provideInteract } from '../../utils/provide-interact';
import { PaymentInteractionRequested } from '../../api/capi-v2';
import delay from '../../utils/delay';
import guid from '../../utils/guid';

describe('Instant payments', () => {
    let paymentsActions: PaymentsActions;
    let invoiceActions: InvoicesActions;
    let invoiceEventActions: InvoicesEventActions;
    let liveShopID: string;
    let partyID: string;

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
        const partiesActions = new PartiesActions(externalAccessToken);
        const party = await partiesActions.getActiveParty();
        partyID = party.id;
    });

    describe('Sane payment and search', async () => {
        let paymentID;
        let invoiceID;
        let paymentMetadata;

        it('should create and proceed payment', async () => {
            const paymentConditions = await PaymentConditions.getInstance();
            const amount = 1000;
            const metadata = { hey: 'there', im: [1, 3, 3, 7] };
            const invoiceAndToken = await invoiceActions.createSimpleInvoice(liveShopID, amount);
            invoiceID = invoiceAndToken.invoice.id;
            const invoiceAccessToken = invoiceAndToken.invoiceAccessToken.payload;
            const tokensActions = new TokensActions(invoiceAccessToken);
            const paymentResource = await tokensActions.createSaneVisaPaymentResource();
            const result = await paymentConditions.proceedInstantPaymentExtend(
                amount,
                paymentResource,
                invoiceAndToken,
                undefined,
                metadata
            );
            paymentID = result.paymentID;
            paymentMetadata = metadata;
        });

        async function pollAnapiSearchPayments() {
            const searchActions = await AnapiSearchActions.getInstance();
            let result = [];
            while (result.length === 0) {
                result = (await searchActions.searchPayments(
                    partyID,
                    moment().subtract(1, 'minutes'),
                    moment(),
                    10,
                    liveShopID,
                    undefined,
                    undefined,
                    undefined,
                    undefined,
                    invoiceID,
                    paymentID
                )).result;
                await delay(500);
            }
            return result;
        }

        it('should search payments in anapi', async () => {
            const result = await Promise.race([delay(10000), pollAnapiSearchPayments()]);
            if (!result) {
                throw new Error('Wait searchPayments result timeout');
            }
            result.length.should.eq(1);
            result[0].id.should.eq(paymentID);
            result[0].invoiceID.should.eq(invoiceID);
            result[0].metadata.should.eql(paymentMetadata);
        });
    });

    it('Create idempotent successful', async () => {
        const paymentConditions = await PaymentConditions.getInstance();
        const amount = 1000;
        let promises = [];
        let tries = 10;
        const externalID = guid();
        const invoiceAndToken = await invoiceActions.createSimpleInvoice(liveShopID, amount);
        const invoiceID = invoiceAndToken.invoice.id;
        const invoiceAccessToken = invoiceAndToken.invoiceAccessToken.payload;
        const tokensActions = new TokensActions(invoiceAccessToken);
        const paymentResource = await tokensActions.createSaneVisaPaymentResource();
        while (tries > 0) {
            let promise = paymentConditions.proceedInstantPaymentExtend(
                amount,
                paymentResource,
                invoiceAndToken,
                externalID
            );
            promises.push(promise);
            tries--;
        }
        const payments = await Promise.all(promises);
        const paymentID = payments[0].paymentID;

        for (let payment of payments) {
            invoiceID.should.eq(payment.invoiceID);
            paymentID.should.eq(payment.paymentID);
        }
    });

    it('Create and proceed payment 3DS', async () => {
        const invoiceAndToken = await invoiceActions.createSimpleInvoice(liveShopID);
        const invoiceID = invoiceAndToken.invoice.id;
        const invoiceAccessToken = invoiceAndToken.invoiceAccessToken.payload;
        const tokensActions = new TokensActions(invoiceAccessToken);
        const paymentResource = await tokensActions.createSecureVisaPaymentResource();
        const payment = await paymentsActions.createInstantPayment(invoiceID, paymentResource);
        const change = await invoiceEventActions.waitConditions([isInvoiceInteracted()], invoiceID);
        await provideInteract(change[0] as PaymentInteractionRequested);
        await invoiceEventActions.waitConditions(
            [isInvoicePaid(), isPaymentCaptured(payment.id)],
            invoiceID
        );
    });

    it('Create and proceed payment 3DS with empty cvv', async () => {
        const invoiceAndToken = await invoiceActions.createSimpleInvoice(liveShopID);
        const invoiceID = invoiceAndToken.invoice.id;
        const invoiceAccessToken = invoiceAndToken.invoiceAccessToken.payload;
        const tokensActions = new TokensActions(invoiceAccessToken);
        const paymentResource = await tokensActions.createSecureEmptyCVVVisaPaymentResource();
        const payment = await paymentsActions.createInstantPayment(invoiceID, paymentResource);
        const change = await invoiceEventActions.waitConditions([isInvoiceInteracted()], invoiceID);
        await provideInteract(change[0] as PaymentInteractionRequested);
        await invoiceEventActions.waitConditions(
            [isInvoicePaid(), isPaymentCaptured(payment.id)],
            invoiceID
        );
    });

    it('Failed with invalid card', async () => {
        const invoiceAndToken = await invoiceActions.createSimpleInvoice(liveShopID);
        const invoiceID = invoiceAndToken.invoice.id;
        const invoiceAccessToken = invoiceAndToken.invoiceAccessToken.payload;
        const tokensActions = new TokensActions(invoiceAccessToken);
        const paymentResource = await tokensActions.createInsufficientFundsVisaPaymentResource();
        const payment = await paymentsActions.createInstantPayment(invoiceID, paymentResource);
        await invoiceEventActions.waitConditions([isPaymentFailed(payment.id)], invoiceID);
    });
});
