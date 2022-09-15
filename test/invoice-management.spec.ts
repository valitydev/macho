import * as chai from 'chai';
import * as moment from 'moment';
import { AnapiSearchActions, BinapiLookupActions, AuthActions, PartiesActions } from '../actions';
import { ShopConditions } from '../conditions';
import { InvoicesActions, InvoicesEventActions } from '../actions/capi-v2';
import delay from '../utils/delay';
import guid from '../utils/guid';

chai.should();

describe('Invoice Management', () => {
    let invoiceActions: InvoicesActions;
    let invoiceEventActions: InvoicesEventActions;
    let liveShopID: string;
    let partyID: string;

    before(async () => {
        const shopConditions = await ShopConditions.getInstance();
        const authActions = AuthActions.getInstance();
        const [liveShop, externalAccessToken] = await Promise.all([
            shopConditions.createShop(),
            authActions.getExternalAccessToken()
        ]);
        liveShopID = liveShop.id;
        invoiceActions = new InvoicesActions(externalAccessToken);
        invoiceEventActions = new InvoicesEventActions(externalAccessToken);
        const partiesActions = new PartiesActions(externalAccessToken);
        const party = await partiesActions.getActiveParty();
        partyID = party.id;
    });

    describe('Create and search invoice', () => {
        let invoiceID;

        it('should successfully create invoice', async () => {
            const invoiceAndToken = await invoiceActions.createSimpleInvoice(liveShopID);
            invoiceID = invoiceAndToken.invoice.id;
        });

        async function pollAnapiSearchInvoices() {
            const searchActions = await AnapiSearchActions.getInstance();
            let result = [];
            while (result.length === 0) {
                result = (await searchActions.searchInvoices(
                    partyID,
                    moment().subtract(1, 'minutes'),
                    moment(),
                    10,
                    liveShopID,
                    undefined,
                    invoiceID
                )).result;
                await delay(500);
            }
            return result;
        }

        it('should search invoice in anapi', async () => {
            const result = await Promise.race([delay(10000), pollAnapiSearchInvoices()]);
            if (!result) {
                throw new Error('Wait searchInvoices result timeout');
            }
            result.length.should.eq(1);
            result[0].id.should.eq(invoiceID);
        });

        it('should return logic error invoice have empty cart', async () => {
            await invoiceActions.createInvoiceWithoutCart();
        });

        it('should return logic error wrong shopId', async () => {
            await invoiceActions.createInvoiceWithWrongShopID();
        });
    });

    describe('Lookup card bin', () => {
        let accessToken: string;

        before(async () => {
            accessToken = await AuthActions.authExternal();
        });

        async function LookupCardBin(cardNumber: string) {
            const lookupActions = new BinapiLookupActions(accessToken);
            return await lookupActions.lookupCardInfo(cardNumber);
        }

        it('should search bin in binapi', async () => {
            await LookupCardBin('4242424242424242');
        });
    });

    describe('Create Invoice idempotency', () => {
        let defaultParams: {
            dueDate: Date;
            amount: number;
        };

        before(async () => {
            const dueDate = moment('2039-04-24')
                .utc()
                .format() as any;
            const amount = 10101;
            defaultParams = { dueDate, amount };
        });

        it('[CAPI-v2]should successfully create invoice idempotent(externalID=undefined)', async () => {
            const invoice_1 = await invoiceActions.createSimpleInvoice(liveShopID);
            const invoice_2 = await invoiceActions.createSimpleInvoice(liveShopID);
            invoice_1.invoice.id.should.not.eq(invoice_2.invoice.id);
        });

        it('should successfully create invoice idempotent', async () => {
            let promises = [];
            let tries = 10;
            const externalID = guid();
            const params = {
                ...defaultParams,
                externalID
            };
            while (tries > 0) {
                let promise = invoiceActions.createSimpleInvoice(liveShopID, params.amount, params);
                promises.push(promise);
                tries--;
            }
            const invoices = await Promise.all(promises);
            const id = invoices[0].invoice.id;
            for (let invoice of invoices) {
                id.should.eq(invoice.invoice.id);
            }
        });

        it('should failed create second invoice idempotent', async () => {
            const externalID = guid();
            let params = {
                ...defaultParams,
                externalID
            };
            const invoice_1 = await invoiceActions.createSimpleInvoice(
                liveShopID,
                params.amount,
                params
            );
            const invoiceID = invoice_1.invoice.id;
            params = {
                ...params,
                amount: params.amount + 1
            };
            const error = await invoiceActions.getCreateInvoiceError(liveShopID, params);
            error.message.should.to.include({
                externalID: externalID,
                id: invoiceID,
                message: "This 'externalID' has been used by another request"
            });
        });
    });

    describe('Create Invoice Access Token', () => {
        it('should successfully create invoice access token', async () => {
            const invoiceAndToken = await invoiceActions.createSimpleInvoice(liveShopID);
            await invoiceActions.createInvoiceAccessToken(invoiceAndToken.invoice.id);
        });
    });

    describe('Invoice events', () => {
        let invoiceID: string;

        before(async () => {
            const invoiceAndToken = await invoiceActions.createSimpleInvoice(liveShopID);
            invoiceID = invoiceAndToken.invoice.id;
        });

        it('should successfully get invoice events', async () => {
            await invoiceEventActions.getEvents(invoiceID);
        });
    });

    describe('Invoice payment methods', () => {
        let invoiceID: string;

        before(async () => {
            const invoiceAndToken = await invoiceActions.createSimpleInvoice(liveShopID);
            invoiceID = invoiceAndToken.invoice.id;
        });

        it('should successfully get invoice payment methods', async () => {
            await invoiceActions.getInvoicePaymentMethods(invoiceID);
        });
    });

    describe('Invoice rescind', () => {
        let invoiceID: string;

        before(async () => {
            const invoiceAndToken = await invoiceActions.createSimpleInvoice(liveShopID);
            invoiceID = invoiceAndToken.invoice.id;
        });

        it('should successfully rescind invoice', async () => {
            await invoiceActions.rescindInvoice(invoiceID, { reason: 'Test rescind invoice' });
        });
    });

    describe('Get invoice', () => {
        let invoiceID: string;

        before(async () => {
            const invoiceAndToken = await invoiceActions.createSimpleInvoice(liveShopID);
            invoiceID = invoiceAndToken.invoice.id;
        });

        it('should successfully get invoice', async () => {
            await invoiceActions.getInvoiceById(invoiceID);
        });
    });

    describe('Invoice terms violation', () => {
        it('should successfully create invoice', async () => {
            let params = {
                amount: 4100000000
            };
            await invoiceActions.createSimpleInvoice(liveShopID, params.amount, params);
        });

        it('should fail to create invoice with amount error', async () => {
            let params = {
                amount: 4300000000,
                cart: [
                    {
                        product: 'Very cool product',
                        quantity: 1,
                        price: 4300000000
                    }
                ]
            };
            const error = await invoiceActions.getCreateInvoiceError(liveShopID, params);
            error.message.should.to.include({
                code: 'invoiceTermsViolated',
                message: 'Invoice parameters violate contract terms'
            });
        });
    });
});
