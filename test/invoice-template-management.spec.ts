import * as chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { AxiosError } from 'axios';
import { AuthActions } from '../actions';
import { ShopConditions } from '../conditions/shop-conditions';
import { InvoiceTemplatesActions } from '../actions/capi-v2/invoice-templates-actions';
import { simpleInvoiceTemplateParams } from '../api/capi-v2/params/invoice-template-params/invoice-template-params';

chai.should();
chai.use(chaiAsPromised);

describe('Invoice Template Management', () => {
    let invoiceTemplatesActions: InvoiceTemplatesActions;
    let liveShopID: string;

    before(async () => {
        const shopConditions = await ShopConditions.getInstance();
        const authActions = AuthActions.getInstance();
        const [liveShop, externalAccessToken] = await Promise.all([
            shopConditions.createShop(),
            authActions.getExternalAccessToken()
        ]);
        liveShopID = liveShop.id;
        invoiceTemplatesActions = new InvoiceTemplatesActions(externalAccessToken);
    });

    it('Create invoice template', async () => {
        const result = await invoiceTemplatesActions.createSimpleInvoiceTemplate(liveShopID);
        result.should.have.property('invoiceTemplate');
        result.should.have.property('invoiceTemplateAccessToken');
        const invoiceTemplate = result.invoiceTemplate;
        invoiceTemplate.should.have.property('id').to.be.a('string');
        invoiceTemplate.should.include({
            shopID: liveShopID,
            description: 'Test product description'
        });
        invoiceTemplate.lifetime.should.deep.equal({
            days: 3,
            months: 0,
            years: 0
        });
        invoiceTemplate.details.should.include({
            templateType: 'InvoiceTemplateMultiLine'
        });
        invoiceTemplate.metadata.should.deep.equal({ test: 1 });
    });

    it('Create invoice with template', async () => {
        const { invoiceTemplate } =
            await invoiceTemplatesActions.createSimpleInvoiceTemplate(liveShopID);
        const invoiceAndToken =
            await invoiceTemplatesActions.createInvoiceWithTemplate(invoiceTemplate.id);
        invoiceAndToken.should.to.have.property('invoice');
        invoiceAndToken.should.to.have.property('invoiceAccessToken');
        const invoice = invoiceAndToken.invoice;
        invoice.should.have.property('id').to.be.a('string');
        invoice.should.have.property('createdAt').to.be.a('string');
        invoice.should.include({
            amount: 10000,
            currency: 'RUB',
            description: 'Test product description',
            product: 'Product 1',
            shopID: liveShopID,
            status: 'unpaid'
        });
        invoice.cart.should.deep.equal([
            {
                cost: 10000,
                price: 10000,
                product: 'Product 1',
                quantity: 1,
                taxMode: {
                    type: 'InvoiceLineTaxVAT',
                    rate: '20%'
                }
            }
        ]);
        invoice.metadata.should.deep.equal({ test: 1 });
    });

    it('Get invoice template by id', async () => {
        const { invoiceTemplate } =
            await invoiceTemplatesActions.createSimpleInvoiceTemplate(liveShopID);
        const result = await invoiceTemplatesActions.getInvoiceTemplateById(invoiceTemplate.id);
        result.should.deep.equal(invoiceTemplate);
    });

    it('Update invoice template', async () => {
        const { invoiceTemplate } =
            await invoiceTemplatesActions.createSimpleInvoiceTemplate(liveShopID);
        const invoiceTemplateCreateParams = simpleInvoiceTemplateParams(liveShopID, {
            description: 'Absolutely new description'
        });
        const result = await invoiceTemplatesActions.updateInvoiceTemplate(
            invoiceTemplateCreateParams,
            invoiceTemplate.id,
        );
        result.should.have.property('id').equal(invoiceTemplate.id);
        result.should.include({
            shopID: liveShopID,
            description: 'Absolutely new description'
        });
        result.lifetime.should.deep.equal({
            days: 3,
            months: 0,
            years: 0
        });
        result.details.should.include({
            templateType: 'InvoiceTemplateMultiLine'
        });
    });

    it('Delete invoice template', async () => {
        const { invoiceTemplate } =
            await invoiceTemplatesActions.createSimpleInvoiceTemplate(liveShopID);
        await invoiceTemplatesActions.deleteInvoiceTemplate(invoiceTemplate.id);
        const error =
            await invoiceTemplatesActions.getInvoiceTemplateById(invoiceTemplate.id)
            .should.eventually.be.rejectedWith(AxiosError);
        error.response.status.should.be.eq(404);
    });
});
