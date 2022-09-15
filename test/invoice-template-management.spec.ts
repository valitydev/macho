import * as chai from 'chai';
import { AuthActions } from '../actions';
import { ShopConditions } from '../conditions/shop-conditions';
import { InvoiceTemplatesActions } from '../actions/capi-v2/invoice-templates-actions';
import { simpleInvoiceTemplateParams } from '../api/capi-v2/params/invoice-template-params/invoice-template-params';

chai.should();

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
        await invoiceTemplatesActions.createSimpleInvoiceTemplate(liveShopID);
    });

    it('Create invoice with template', async () => {
        const invoiceTemplateAndToken = await invoiceTemplatesActions.createSimpleInvoiceTemplate(
            liveShopID
        );
        const invoiceTemplateID = invoiceTemplateAndToken.invoiceTemplate.id;
        await invoiceTemplatesActions.createInvoiceWithTemplate(invoiceTemplateID, liveShopID);
    });

    it('Get invoice template by id', async () => {
        const invoiceTemplateAndToken = await invoiceTemplatesActions.createSimpleInvoiceTemplate(
            liveShopID
        );
        const invoiceTemplateID = invoiceTemplateAndToken.invoiceTemplate.id;
        await invoiceTemplatesActions.getInvoiceTemplateById(invoiceTemplateID, liveShopID);
    });

    it('Update invoice template', async () => {
        const invoiceTemplateAndToken = await invoiceTemplatesActions.createSimpleInvoiceTemplate(
            liveShopID
        );
        const invoiceTemplateID = invoiceTemplateAndToken.invoiceTemplate.id;
        const invoiceTemplateCreateParams = simpleInvoiceTemplateParams(liveShopID, {
            description: 'Absolutely new description'
        });
        await invoiceTemplatesActions.updateInvoiceTemplate(
            invoiceTemplateCreateParams,
            invoiceTemplateID,
            liveShopID,
            { description: 'Absolutely new description' }
        );
    });

    it('Delete invoice template', async () => {
        const invoiceTemplateAndToken = await invoiceTemplatesActions.createSimpleInvoiceTemplate(
            liveShopID
        );
        const invoiceTemplateID = invoiceTemplateAndToken.invoiceTemplate.id;
        await invoiceTemplatesActions.deleteInvoiceTemplate(invoiceTemplateID);
    });
});
