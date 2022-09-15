import * as moment from 'moment';
import { InvoiceLineTaxMode, InvoiceLineTaxVAT, InvoiceParams } from '../../codegen';
import { Invoice, InvoiceParamsWithTemplate } from '../../index';

export function simpleInvoiceParams(shopID: string, params?: {}): InvoiceParams {
    return {
        shopID: shopID,
        dueDate: moment()
            .add(1, 'days')
            .utc()
            .format() as any,
        amount: 10000,
        currency: 'RUB',
        product: 'Test product',
        description: 'Test product description',
        cart: [
            {
                product: 'Product 1',
                quantity: 1,
                price: 10000,
                taxMode: {
                    type: InvoiceLineTaxMode.TypeEnum.InvoiceLineTaxVAT,
                    rate: InvoiceLineTaxVAT.RateEnum._10
                } as InvoiceLineTaxVAT
            }
        ],
        metadata: {
            test: 1
        },
        ...params
    } as InvoiceParams;
}

export function invoiceParamsWithTemplate(params?: {}): InvoiceParamsWithTemplate {
    return {
        amount: 10000,
        currency: 'RUB',
        metadata: { test: 1 },
        ...params
    };
}

export function assertSimpleInvoice(invoice: Invoice, amount: number, shopID: string) {
    invoice.should.to.include({
        amount,
        currency: 'RUB',
        description: 'Test product description',
        product: 'Test product',
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
