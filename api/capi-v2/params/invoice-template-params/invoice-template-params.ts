import {
    InvoiceLineTaxMode,
    InvoiceLineTaxVAT
} from '../../codegen';
import {
    InvoiceTemplateCreateParams
} from '../../index';

import TaxModeT = InvoiceLineTaxMode.TypeEnum;
import VatRateT = InvoiceLineTaxVAT.RateEnum;

export function simpleInvoiceTemplateParams(
    partyID: string,
    shopID: string,
    params?: {}
): InvoiceTemplateCreateParams {
    return {
        partyID,
        shopID,
        product: 'Test product',
        description: 'Test product description',
        lifetime: {
            days: 3,
            months: 0,
            years: 0
        },
        details: {
            templateType: 'InvoiceTemplateMultiLine',
            cart: [
                {
                    product: 'Product 1',
                    quantity: 1,
                    price: 10000,
                    taxMode: {
                        type: TaxModeT.InvoiceLineTaxVAT,
                        rate: VatRateT._20
                    } as InvoiceLineTaxVAT
                }
            ],
            currency: 'RUB'
        },
        metadata: { test: 1 },
        ...params
    } as InvoiceTemplateCreateParams;
}
