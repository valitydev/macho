import * as yargs from 'yargs';
import { Statuses, TransactionReporter } from '../utils/transaction-reporter';
import { measure } from '../utils';
import {
    // ClaimsActions,
    PartiesActions,
    InvoicesActions,
    InvoicesEventActions,
    isInvoicePaid,
    PaymentsActions,
    ShopsActions,
    TokensActions
} from '../actions/capi-v2';
import { AuthActions } from '../actions';
import { saneVisaPaymentTool } from '../api';

describe('Test transaction', () => {
    const reporter = new TransactionReporter({
        auth: yargs.argv['auth-warn'],
        createInvoice: yargs.argv['create-invoice-warn'],
        createPaymentResource: yargs.argv['create-payment-resource-warn'],
        createPayment: yargs.argv['create-payment-warn'],
        polling: yargs.argv['polling-warn'],
        fulfillInvoice: yargs.argv['fulfill-invoice-warn']
    });

    const testShopID = yargs.argv['test-shop-id'];
    let accessToken: string;
    let partyID: string;

    before(async () => {
        try {
            const response = await measure(AuthActions.authExternal, AuthActions);
            reporter.setAuthTime(response.time);
            accessToken = response.result;
            const shopsActions = new ShopsActions(accessToken);
            try {
                const party = await (await PartiesActions.getInstance()).getActiveParty();
                await shopsActions.getShopByID(testShopID, party.id);
                partyID = party.id;
            } catch (e) {
                const createTestShop = yargs.argv['create-test-shop'];
                if (e.status === 404 && createTestShop) {
                    // shop not found, but we want to create it
                    // looks _uebansky_, but I don't care
                    // const claimsActions = new ClaimsActions(accessToken);
                    // await claimsActions.createClaimForTestShop(testShopID);
                } else {
                    reporter.report(Statuses.failed);
                    throw e;
                }
            }
        } catch (e) {
            reporter.report(Statuses.failed);
            throw e;
        }
    });

    it('should perform instant payment', async () => {
        const invoiceActions = new InvoicesActions(accessToken);
        const invoiceEventActions = new InvoicesEventActions(accessToken);
        const paymentActions = new PaymentsActions(accessToken);
        const invoice = await measure(
            () => invoiceActions.createSimpleInvoice(partyID, testShopID),
            invoiceActions
        );
        const invoiceID = invoice.result.invoice.id;
        const invoiceAccessToken = invoice.result.invoiceAccessToken.payload;
        const tokensActions = new TokensActions(invoiceAccessToken);
        const paymentRes = await measure(
            () => tokensActions.createPaymentResource(saneVisaPaymentTool),
            tokensActions
        );
        try {
            const paymentResource = paymentRes.result;
            reporter.setCreateInvoiceTime(invoice.time);
            reporter.setCreatePaymentResourceTime(paymentRes.time);
            const instantPayment = await measure(
                paymentActions.createInstantPayment,
                paymentActions,
                [invoiceID, paymentResource]
            );
            reporter.setPaymentTime(instantPayment.time);
            const pollEvents = await measure(
                invoiceEventActions.waitConditions,
                invoiceEventActions,
                [[isInvoicePaid()], invoiceID]
            );
            reporter.setPollingTime(pollEvents.time);
            const fulfillInvoice = await measure(invoiceActions.fulfillInvoice, invoiceActions, [
                invoiceID
            ]);
            reporter.setFulfillInvoiceTime(fulfillInvoice.time);
            reporter.report(Statuses.completed);
            // reporter.hasTimeWarn() && process.exit(1);
        } catch (e) {
            reporter.report(Statuses.failed);
            throw e;
        }
    });
});
