import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { AxiosError } from 'axios';
import { ShopConditions } from '../../conditions';
import { AuthActions } from '../../actions';
import { TokensActions, InvoicesActions } from '../../actions/capi-v2';
import {
    saneVisaPaymentTool,
    secureVisaPaymentTool,
    cryptoPaymentTool,
    badCardholderPaymentTool,
    qiwiPaymentTool
} from '../../api';
import {
    ClientInfo,
    PaymentToolDetailsBankCard,
    PaymentToolDetailsDigitalWallet,
    PaymentToolDetailsCryptoWallet
} from '../../api/capi-v2/codegen';

chai.should();
chai.use(chaiAsPromised);

describe('Payment resource', () => {
    let tokensActions: TokensActions;

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
    });

    it('should tokenize bank card payment resource', async () => {
        const resource = await tokensActions.createPaymentResource(saneVisaPaymentTool);
        resource.should.have.property('paymentToolToken').to.be.a('string');
        resource.should.have.property('paymentSession').to.be.a('string');
        resource.should.have.property('clientInfo').to.be.an('object');
        resource.should.have.property('paymentToolDetails').to.be.an('object');
        const clientInfo = resource['clientInfo'] as ClientInfo; // TODO swagger multi inheritance bug
        clientInfo.should.have.property('fingerprint').to.be.a('string');
        resource.paymentToolDetails.should.deep.eq({
            cardNumberMask: '424242******4242',
            last4: '4242',
            first6: '424242',
            detailsType: 'PaymentToolDetailsBankCard',
            paymentSystem: 'VISA'
        } as PaymentToolDetailsBankCard);
    });

    it('should tokenize visa payment resource with user ip', async () => {
        const ip = "1.2.3.4";
        const resource = await tokensActions.createPaymentResource({
            paymentTool: secureVisaPaymentTool.paymentTool,
            clientInfo: {
                ...secureVisaPaymentTool.clientInfo,
                ip
            }
        });
        resource.should.have.property('paymentToolToken').to.be.a('string');
        resource.should.have.property('paymentSession').to.be.a('string');
        resource.should.have.property('paymentToolDetails').to.be.an('object');
        resource.should.have.property('clientInfo').to.be.an('object');
        resource.should.have.nested.property('clientInfo.ip').eq(ip);
        resource.paymentToolDetails.should.deep.eq({
            cardNumberMask: '401288******1881',
            last4: '1881',
            first6: '401288',
            detailsType: 'PaymentToolDetailsBankCard',
            paymentSystem: 'VISA'
        } as PaymentToolDetailsBankCard);
    });

    it('should tokenize qiwi wallet payment resource', async () => {
        const resource = await tokensActions.createPaymentResource(qiwiPaymentTool);
        resource.should.have.property('paymentToolToken').to.be.a('string');
        resource.should.have.property('paymentSession').to.be.a('string');
        resource.should.have.property('paymentToolDetails').to.be.an('object');
        resource.paymentToolDetails.should.deep.eq({
            detailsType: 'PaymentToolDetailsDigitalWallet',
            provider: 'qiwi'
        } as PaymentToolDetailsDigitalWallet);
    });

    it('should tokenize crypto wallet payment resource', async () => {
        const resource = await tokensActions.createPaymentResource(cryptoPaymentTool);
        resource.should.have.property('paymentToolToken').to.be.a('string');
        resource.should.have.property('paymentSession').to.be.a('string');
        resource.should.have.property('paymentToolDetails').to.be.an('object');
        resource.paymentToolDetails.should.deep.eq({
            detailsType: 'PaymentToolDetailsCryptoWallet',
            cryptoCurrency: 'bitcoinCash'
        } as PaymentToolDetailsCryptoWallet);
    });

    it('should refuse bad cardholder format', async () => {
        const error =
            await tokensActions.createPaymentResource(badCardholderPaymentTool)
                .should.eventually.be.rejectedWith(AxiosError);
        error.response.data.should.include({
            code: 'invalidRequest'
        });
    });
});
