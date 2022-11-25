import * as chai from 'chai';
import {
    AccessToken,
    Invoice,
    InvoiceAndToken,
    InvoiceParams,
    InvoicesApiFp,
    PaymentMethod,
    Reason
} from '../../api/capi-v2/codegen';
import { simpleInvoiceParams } from '../../api/capi-v2/params';
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

    createInvoice(params: InvoiceParams): Promise<InvoiceAndToken> {
        return this.dispatcher.callMethod(this.api.createInvoice, params);
    }

    createSimpleInvoice(
        shopID: string,
        amount: number = 10000,
        params?: {}
    ): Promise<InvoiceAndToken> {
        return this.createInvoice(simpleInvoiceParams(shopID, amount, params));
    }

    createInvoiceAccessToken(invoiceID: string): Promise<AccessToken> {
        return this.dispatcher.callMethod(this.api.createInvoiceAccessToken, invoiceID);
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
        return this.dispatcher.callMethod(this.api.getInvoiceByID, invoiceID);
    }

    getInvoicePaymentMethods(invoiceID: string): Promise<PaymentMethod[]> {
        return this.dispatcher.callMethod(this.api.getInvoicePaymentMethods, invoiceID);
    }
}
