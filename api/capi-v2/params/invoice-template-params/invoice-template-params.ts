import { InvoiceLineTaxVAT } from '../../codegen';
import { Invoice, InvoiceTemplate, InvoiceTemplateCreateParams } from '../../index';

export function simpleInvoiceTemplateParams(
    shopID: string,
    params?: {}
): InvoiceTemplateCreateParams {
    return {
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
                        type: 'InvoiceLineTaxVAT',
                        rate: '10%'
                    }
                }
            ],
            currency: 'RUB'
        },
        metadata: { test: 1 },
        ...params
    } as InvoiceTemplateCreateParams;
}

export function assertSimpleInvoiceTemplate(
    invoiceTemplate: InvoiceTemplate,
    shopID: string,
    assertParams?: {}
) {
    invoiceTemplate.should.to.include({
        shopID: shopID,
        description: 'Test product description',
        ...assertParams
    });
    invoiceTemplate.lifetime.should.to.deep.equal({
        days: 3,
        months: 0,
        years: 0
    });
    invoiceTemplate.details.should.to.include({
        templateType: 'InvoiceTemplateMultiLine'
    });
    invoiceTemplate.should.to.have.property('id').to.be.a('string');
    invoiceTemplate.metadata.should.to.deep.equal({ test: 1 });
}

export function assertSimpleInvoiceWithTemplate(invoice: Invoice, amount: number, shopID: string) {
    invoice.should.to.include({
        amount,
        currency: 'RUB',
        description: 'Test product description',
        product: 'Product 1',
        shopID: shopID,
        status: 'unpaid'
    });
    invoice.cart.should.to.deep.equal([
        {
            cost: amount,
            price: amount,
            product: 'Product 1',
            quantity: 1,
            taxMode: {
                type: 'InvoiceLineTaxVAT',
                rate: '10%'
            }
        }
    ]);
    invoice.metadata.should.to.deep.equal({ test: 1 });
    invoice.should.to.have.property('createdAt').to.be.a('string');
    invoice.should.to.have.property('id').to.be.a('string');
}
