import { ShopConditions } from '../../conditions';
import { AuthActions } from '../../actions';
import { TokensActions, InvoicesActions } from '../../actions/capi-v2';
import guid from '../../utils/guid';
import { saneVisaPaymentTool } from '../../api/capi-v2/params/payment-tools/sane-visa-payment-tool';
import { badCardholderPaymentTool } from '../../api/capi-v2/params/payment-tools/bad-cardholder-payment-tool';
import { PaymentResourceParams } from '../../api/capi-v2/codegen/api';
import { paymentParams } from '../../api/capi-v2/params/payment-params/payment-params';

describe('Payment resource', () => {
    let tokensActions: TokensActions;
    let paymentParams: PaymentResourceParams;

    before(async () => {
        const shopConditions = await ShopConditions.getInstance();
        const authActions = AuthActions.getInstance();
        const [externalAccessToken, shop] = await Promise.all([
            authActions.getExternalAccessToken(),
            shopConditions.createShop()
        ]);
        const invoiceActions = new InvoicesActions(externalAccessToken);
        const invoiceAndToken = await invoiceActions.createSimpleInvoice(shop.id);
        const invoiceAccessToken = invoiceAndToken.invoiceAccessToken.payload;
        tokensActions = new TokensActions(invoiceAccessToken);
        const externalID = guid();
        paymentParams = {
            ...saneVisaPaymentTool,
            externalID
        };
    });
    // Now we cann't use simple compare for checking idepmotent feature.
    // We must rewrite this tests, maybe use jose for decryption and more
    // deep compare.
    // it('Create idempotent successful', async () => {
    //     let resource  = await tokensActions.createPaymentResource(paymentParams);
    //     let resource2 = await tokensActions.createPaymentResource(paymentParams);

    //     resource.should.to.deep.eq(resource2);
    // });

    // it('Create resource with different sessionID successful', async () => {
    //     const externalID = guid();
    //     let params = {
    //         ...paymentParams,
    //         externalID
    //     };
    //     let resource  = await tokensActions.createPaymentResource(paymentParams);
    //     let resource2 = await tokensActions.createPaymentResource(params);
    //     resource.should.not.to.deep.eq(resource2);
    // });

    it('Create resource with different params failed', async () => {
        let paymentTool = {
            ...paymentParams.paymentTool,
            cardNumber: '4111111111111111',
            expDate: '01/21',
            cardHolder: 'BukaBjaka', // not important(doesn't influence paymentToolToken generation)
            cvv: '234' // see previous comment
        };
        let paymentParams2 = {
            ...paymentParams,
            paymentTool
        };

        let resource = await tokensActions.createPaymentResource(paymentParams);
        let error = await tokensActions.createPaymentResourceError(paymentParams2);
        error.message.should.to.include({
            externalID: paymentParams.externalID,
            message: "This 'externalID' has been used by another request"
        });
    });

    it('Refuse bad cardholder format', async () => {
        const externalID = guid();
        let params = {
            ...badCardholderPaymentTool,
            externalID
        };
        let error = await tokensActions.createPaymentResourceError(params);
        error.message.should.to.include({
            code: 'invalidRequest'
        });
    });
});
