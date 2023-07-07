import {
    InvoiceAndToken,
    InvoiceTemplate,
    InvoiceTemplateAndToken,
    InvoiceTemplateCreateParams,
    InvoiceTemplatesApiFp,
    PaymentMethod
} from '../../api/capi-v2/codegen';
import { simpleInvoiceTemplateParams } from '../../api/capi-v2/params/invoice-template-params/invoice-template-params';
import { invoiceParamsWithTemplate } from '../../api/capi-v2/params';
import { CAPIDispatcher } from '../../utils/codegen-utils';

export class InvoiceTemplatesActions {
    private api;
    private dispatcher: CAPIDispatcher;

    constructor(accessToken: string) {
        this.dispatcher = new CAPIDispatcher({
            headers: {
                origin: 'https://dashboard.stage.empayre.com'
            }
        });
        this.api = InvoiceTemplatesApiFp({
            apiKey: `Bearer ${accessToken}`
        });
    }

    createSimpleInvoiceTemplate(partyID: string, shopID: string): Promise<InvoiceTemplateAndToken> {
        let templateParams: InvoiceTemplateCreateParams = simpleInvoiceTemplateParams(partyID, shopID);
        return this.dispatcher
            .callMethod(this.api.createInvoiceTemplate, templateParams);
    }

    createInvoiceWithTemplate(invoiceTemplateID: string): Promise<InvoiceAndToken> {
        return this.dispatcher
            .callMethod(
                this.api.createInvoiceWithTemplate,
                invoiceTemplateID,
                invoiceParamsWithTemplate()
            );
    }

    getInvoiceTemplateById(invoiceTemplateID: string): Promise<InvoiceTemplate> {
        return this.dispatcher
            .callMethod(this.api.getInvoiceTemplateByID, invoiceTemplateID);
    }

    updateInvoiceTemplate(
        invoiceTemplateCreateParams: InvoiceTemplateCreateParams,
        invoiceTemplateID: string
    ): Promise<InvoiceTemplate> {
        return this.dispatcher
            .callMethod(
                this.api.updateInvoiceTemplate,
                invoiceTemplateID,
                invoiceTemplateCreateParams
            );
    }

    deleteInvoiceTemplate(invoiceTemplateID: string): Promise<void> {
        return this.dispatcher.callMethod(this.api.deleteInvoiceTemplate, invoiceTemplateID);
    }

    getInvoicePaymentMethodsByTemplateID(invoiceTemplateID: string): Promise<PaymentMethod[]> {
        return this.dispatcher
            .callMethod(this.api.getInvoicePaymentMethodsByTemplateID, invoiceTemplateID);
    }
}
