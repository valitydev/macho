import * as chai from 'chai';
import * as moment from 'moment';
import {
    AccessToken,
    Invoice,
    InvoiceAndToken,
    InvoiceParams,
    InvoicesApiFp,
    LogicError,
    PaymentMethod,
    Reason
} from '../../api/capi-v2/codegen';
import { assertSimpleInvoice, simpleInvoiceParams } from '../../api/capi-v2/params';
import { CAPIDispatcher } from '../../utils/codegen-utils';

chai.should();

export class InvoicesActions {
    private api;
    private dispatcher: CAPIDispatcher;

    constructor(accessToken: string) {
        this.dispatcher = new CAPIDispatcher({});
        this.api = InvoicesApiFp({
            apiKey: `Bearer ${accessToken}`
        });
    }

    createSimpleInvoice(
        shopID: string = 'TEST',
        amount: number = 10000,
        params?: {}
    ): Promise<InvoiceAndToken> {
        let invoiceParams = simpleInvoiceParams(shopID, params);
        invoiceParams = {
            ...invoiceParams,
            amount,
            cart: [
                {
                    ...invoiceParams.cart[0],
                    price: amount
                }
            ]
        };
        return this.dispatcher
            .callMethod(this.api.createInvoice, invoiceParams)
            .then(invoiceAndToken => {
                invoiceAndToken.should.to.have.property('invoice');
                const invoice = invoiceAndToken.invoice;
                assertSimpleInvoice(invoice, amount, shopID);
                invoice.should.to.have.property('dueDate').to.eq(invoiceParams.dueDate);
                invoiceAndToken.should.to.have.nested
                    .property('invoiceAccessToken.payload')
                    .to.be.a('string');
                return invoiceAndToken;
            });
    }

    getCreateInvoiceError(shopID: string, params?: {}): Promise<LogicError> {
        let invoiceParams: InvoiceParams = simpleInvoiceParams(shopID, params);
        return this.dispatcher.callMethod(this.api.createInvoice, invoiceParams).catch(error => {
            return error;
        });
    }

    createInvoiceWithoutCart(shopID: string = 'TEST'): Promise<LogicError> {
        let invoiceParams: InvoiceParams = simpleInvoiceParams(shopID, { cart: [] });
        return this.dispatcher.callMethod(this.api.createInvoice, invoiceParams).catch(error => {
            error.message.should.to.include({
                code: 'invalidInvoiceCart',
                message: 'Wrong size. Path to item: cart'
            });
            return error;
        });
    }

    createInvoiceWithWrongShopID(shopID: string = 'TEST'): Promise<LogicError> {
        let invoiceParams: InvoiceParams = simpleInvoiceParams(shopID);
        return this.dispatcher.callMethod(this.api.createInvoice, invoiceParams).catch(error => {
            error.message.should.to.include({
                code: 'invalidShopID',
                message: 'Shop not found'
            });
            return error;
        });
    }

    createInvoiceWithWrongDueDate(shopID: string = 'TEST'): Promise<LogicError> {
        let invoiceParams: InvoiceParams = simpleInvoiceParams(shopID, {
            dueDate: moment()
                .subtract(15, 'days')
                .utc()
                .format() as any
        });
        return this.dispatcher.callMethod(this.api.createInvoice, invoiceParams).catch(error => {
            return error;
        });
    }

    createInvoiceAccessToken(invoiceID: string): Promise<AccessToken> {
        return this.dispatcher
            .callMethod(this.api.createInvoiceAccessToken, invoiceID)
            .then(response => {
                response.should.to.have.property('payload').to.be.a('string');
                return response;
            });
    }

    fulfillInvoice(invoiceID: string): Promise<void> {
        return this.dispatcher.callMethod(this.api.fulfillInvoice, invoiceID, {
            reason: 'test reason'
        });
    }

    rescindInvoice(invoiceID: string, reason: Reason): Promise<Response> {
        return this.dispatcher.callMethod(this.api.rescindInvoice, invoiceID, reason);
    }

    getInvoiceById(invoiceID: string): Promise<Invoice> {
        return this.dispatcher
            .callMethod(this.api.getInvoiceByID, invoiceID)
            .then(invoice => invoice);
    }

    getInvoicePaymentMethods(invoiceID: string): Promise<PaymentMethod[]> {
        return this.dispatcher
            .callMethod(this.api.getInvoicePaymentMethods, invoiceID)
            .then(methods => {
                methods.should.to.deep.members([
                    { method: 'BankCard', paymentSystems: ['mastercard', 'nspkmir', 'visa'] },
                    { method: 'DigitalWallet', providers: ['qiwi'] },
                    { method: 'PaymentTerminal', providers: ['euroset'] }
                ]);
                return methods;
            });
    }
}
