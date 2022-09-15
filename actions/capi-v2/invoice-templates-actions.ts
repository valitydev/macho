import {
    InvoiceAndToken,
    InvoiceTemplate,
    InvoiceTemplateAndToken,
    InvoiceTemplateCreateParams,
    InvoiceTemplatesApiFp,
    PaymentMethod
} from '../../api/capi-v2/codegen';
import {
    assertSimpleInvoiceTemplate,
    assertSimpleInvoiceWithTemplate,
    simpleInvoiceTemplateParams
} from '../../api/capi-v2/params/invoice-template-params/invoice-template-params';
import { invoiceParamsWithTemplate } from '../../api/capi-v2/params';
import { CAPIDispatcher } from '../../utils/codegen-utils';

export class InvoiceTemplatesActions {
    private api;
    private dispatcher: CAPIDispatcher;

    constructor(accessToken: string) {
        this.dispatcher = new CAPIDispatcher({});
        this.api = InvoiceTemplatesApiFp({
            apiKey: `Bearer ${accessToken}`
        });
    }

    createSimpleInvoiceTemplate(shopID: string): Promise<InvoiceTemplateAndToken> {
        let templateParams: InvoiceTemplateCreateParams = simpleInvoiceTemplateParams(shopID);
        return this.dispatcher
            .callMethod(this.api.createInvoiceTemplate, templateParams)
            .then(invoiceTemplateAndToken => {
                invoiceTemplateAndToken.should.to.have.property('invoiceTemplate');
                invoiceTemplateAndToken.should.to.have.property('invoiceTemplateAccessToken');
                const invoiceTemplate = invoiceTemplateAndToken.invoiceTemplate;
                assertSimpleInvoiceTemplate(invoiceTemplate, shopID);
                return invoiceTemplateAndToken;
            });
    }

    createInvoiceWithTemplate(invoiceTemplateID: string, shopID: string): Promise<InvoiceAndToken> {
        return this.dispatcher
            .callMethod(
                this.api.createInvoiceWithTemplate,
                invoiceTemplateID,
                invoiceParamsWithTemplate()
            )
            .then(invoiceAndToken => {
                invoiceAndToken.should.to.have.property('invoice');
                invoiceAndToken.should.to.have.property('invoiceAccessToken');
                const invoice = invoiceAndToken.invoice;
                assertSimpleInvoiceWithTemplate(
                    invoice,
                    invoiceParamsWithTemplate().amount,
                    shopID
                );
                return invoiceAndToken;
            });
    }

    getInvoiceTemplateById(invoiceTemplateID: string, shopID: string): Promise<InvoiceTemplate> {
        return this.dispatcher
            .callMethod(this.api.getInvoiceTemplateByID, invoiceTemplateID)
            .then(invoiceTemplate => {
                assertSimpleInvoiceTemplate(invoiceTemplate, shopID);
                return invoiceTemplate;
            });
    }

    updateInvoiceTemplate(
        invoiceTemplateCreateParams: InvoiceTemplateCreateParams,
        invoiceTemplateID: string,
        shopID: string,
        assertParams?: {}
    ): Promise<InvoiceTemplate> {
        return this.dispatcher
            .callMethod(
                this.api.updateInvoiceTemplate,
                invoiceTemplateID,
                invoiceTemplateCreateParams
            )
            .then(invoiceTemplate => {
                assertSimpleInvoiceTemplate(invoiceTemplate, shopID, assertParams);
                return invoiceTemplate;
            });
    }

    deleteInvoiceTemplate(invoiceTemplateID: string): Promise<void> {
        return this.dispatcher.callMethod(this.api.deleteInvoiceTemplate, invoiceTemplateID);
    }

    getInvoicePaymentMethodsByTemplateID(invoiceTemplateID: string): Promise<PaymentMethod[]> {
        return this.dispatcher
            .callMethod(this.api.getInvoicePaymentMethodsByTemplateID, invoiceTemplateID)
            .then(paymentMethods => {
                return paymentMethods;
            });
    }
}
