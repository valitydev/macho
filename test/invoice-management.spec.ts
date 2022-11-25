import * as chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import chaiMoment from 'chai-moment';
import moment from 'moment';
import { AxiosError } from 'axios';
import {
    AuthActions,
    PartiesActions,
    AnapiSearchActions
} from '../actions';
import { ShopConditions } from '../conditions';
import { InvoicesActions, InvoicesEventActions } from '../actions/capi-v2';
import { Invoice, InvoiceParams } from '../api/capi-v2/codegen';
import { assertSimpleInvoice, simpleInvoiceParams } from '../api/capi-v2/params';
import guid from '../utils/guid';
import until from '../utils/until';

chai.should();
chai.use(chaiAsPromised);
chai.use(chaiMoment);

describe('Invoice Management', () => {
    let invoiceActions: InvoicesActions;
    let invoiceEventActions: InvoicesEventActions;
    let searchActions: AnapiSearchActions;
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
        searchActions = new AnapiSearchActions(externalAccessToken);
        const partiesActions = new PartiesActions(externalAccessToken);
        const party = await partiesActions.getActiveParty();
        partyID = party.id;
    });

    describe('Create and search invoice', () => {
        let invoiceID: string;

        it('should successfully create invoice', async () => {
            const invoiceParams = simpleInvoiceParams(liveShopID);
            const result = await invoiceActions.createInvoice(invoiceParams);
            result.should.to.have.property('invoice');
            assertSimpleInvoice(result.invoice, invoiceParams.amount, liveShopID);
            invoiceID = result.invoice.id;
            result.invoice.should.have
                .property('dueDate').to.be.sameMoment(invoiceParams.dueDate);
            result.should.have
                .nested.property('invoiceAccessToken.payload')
                .to.be.a('string');
        });

        it('should search created invoice', async () => {
            const { result } =
                await until(() => searchActions.searchInvoices({
                    partyID,
                    fromTime: moment().subtract(7, 'days'),
                    toTime: moment(),
                    limit: 10,
                    paymentInstitutionRealm: 'test',
                    shopID: liveShopID,
                    invoiceID
                }))
                    .satisfy(search => {
                        if (search.result.length < 1) {
                            throw new Error('Search returned 0 invoices');
                        }
                    });
            result.length.should.eq(1);
            result[0].should.have.property('id').eq(invoiceID);
        });

        it('should return logic error invoice have empty cart', async () => {
            const error =
                await invoiceActions.createSimpleInvoice(liveShopID, 10000, {cart: []})
                    .should.eventually.be.rejectedWith(AxiosError);
            error.response.status.should.be.eq(400);
            error.response.data.should.include({
                code: 'invalidRequest',
                message: 'Request parameter: InvoiceParams, ' +
                    'error type: schema_violated, ' +
                    'description: Wrong size. Path to item: cart'
            });
        });

        it('should return logic error wrong shopId', async () => {
            const error =
                await invoiceActions.createSimpleInvoice('SHOULDBENOSUCHSHOP')
                    .should.eventually.be.rejectedWith(AxiosError);
            error.response.status.should.be.eq(400);
            error.response.data.should.to.include({
                code: 'invalidShopID',
                message: 'Shop not found'
            });
        });

        it('should be cancelled if dueDate in the past', async () => {
            const past = moment().subtract(15, 'days').utc().toDate();
            const result = await invoiceActions.createSimpleInvoice(liveShopID, 10000, {dueDate: past});
            result.should.have.property('invoice');
            const invoiceID = result.invoice.id;
            await until(() => invoiceActions.getInvoiceById(invoiceID)).satisfy(invoice => {
                if (invoice.status !== Invoice.StatusEnum.Cancelled) {
                    throw new Error(`Invoice ${invoiceID} is still ${invoice.status}`);
                }
            })
        });

    });

    describe('Idempotency', () => {
        let defaultParams: {
            dueDate: Date;
            amount: number;
        };

        before(async () => {
            const dueDate = moment('2039-04-24')
                .utc()
                .toDate();
            const amount = 10101;
            defaultParams = { dueDate, amount };
        });

        it('should successfully create invoice idempotent (externalID: undefined)', async () => {
            const invoice1 = await invoiceActions.createSimpleInvoice(liveShopID);
            const invoice2 = await invoiceActions.createSimpleInvoice(liveShopID);
            invoice1.invoice.id.should.not.eq(invoice2.invoice.id);
        });

        it('should idempotently create single invoice after several attempts', async () => {
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
            for (const invoice of invoices) {
                invoices[0].invoice.id.should.be.eq(invoice.invoice.id);
            }
        });

        it('should fail to create conflicting invoice', async () => {
            const externalID = guid();
            const params1 = {
                dueDate: defaultParams.dueDate,
                externalID
            };
            const amount1 = 10101;
            const invoice1 = await invoiceActions.createSimpleInvoice(
                liveShopID,
                amount1,
                params1
            );
            const error =
                await invoiceActions.createSimpleInvoice(
                    liveShopID,
                    amount1 + 1,
                    params1
                )
                .should.eventually.be.rejectedWith(AxiosError);
            error.response.status.should.be.equal(409);
            error.response.data.should.include({
                externalID: externalID,
                id: invoice1.invoice.id,
                message: "This 'externalID' has been used by another request"
            });
        });

    });

    it('should successfully issue invoice access token', async () => {
        const invoiceAndToken = await invoiceActions.createSimpleInvoice(liveShopID);
        const response = await invoiceActions.createInvoiceAccessToken(invoiceAndToken.invoice.id);
        response.should.to.have.property('payload').to.be.a('string');
    });

    describe('Invoice events', () => {
        let invoiceID: string;

        before(async () => {
            const { invoice } = await invoiceActions.createSimpleInvoice(
                liveShopID,
                10000,
                { dueDate: moment() }
            );
            invoiceID = invoice.id;
        });

        it('should successfully get invoice events', async () => {

            const events1 = await invoiceEventActions.getEvents(invoiceID, 1);
            events1.should.be.an('array');
            events1.length.should.be.eq(1);
            events1[0].id.should.be.eq(1);
            events1[0].changes.should.be.an('array');
            events1[0].changes[0]
                .should.include({changeType: 'InvoiceCreated'});
            events1[0].changes[0]
                .should.have.property('invoice')
                .that.includes({
                    id: invoiceID,
                    shopID: liveShopID,
                    amount: 10000,
                    status: 'unpaid'
                });

            const events2 = await until(() => invoiceEventActions.getEvents(invoiceID, 1, 1))
                .satisfy(events => {
                    if (events.length < 1) {
                        throw new Error(`No invoice ${invoiceID} events since event 1`);
                    }
                });
            events2.length.should.be.eq(1);
            events2[0].id.should.be.eq(2);
            events2[0].changes[0].should.include({
                changeType: 'InvoiceStatusChanged',
                status: 'cancelled'
            });

            const events = await invoiceEventActions.getEvents(invoiceID);
            events.should.be.an('array');
            events.length.should.be.eq(2);
            
        });

    });

    describe('Invoice payment methods', () => {
        let invoiceID: string;

        before(async () => {
            const invoiceAndToken = await invoiceActions.createSimpleInvoice(liveShopID);
            invoiceID = invoiceAndToken.invoice.id;
        });

        it('should successfully get invoice payment methods', async () => {
            const methods = await invoiceActions.getInvoicePaymentMethods(invoiceID);
            methods.should.have.deep.members([
                { method: 'BankCard', paymentSystems: ['MASTERCARD', 'VISA'] }
                // { method: 'DigitalWallet', providers: ['qiwi'] },
                // { method: 'PaymentTerminal', providers: ['euroset'] }
            ]);
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
            await invoiceActions.createSimpleInvoice(liveShopID, 4100000);
        });

        it('should fail to create invoice with amount error', async () => {
            const params: InvoiceParams = simpleInvoiceParams(liveShopID, 4300000);
            const error = await invoiceActions.createInvoice(params)
                .should.eventually.be.rejectedWith(AxiosError);
            error.response.status.should.be.eq(400);
            error.response.data.should.include({
                code: 'invoiceTermsViolated',
                message: 'Invoice parameters violate contract terms'
            });
        });

    });

});
