import * as chai from 'chai';
import {
    insufficientFundsVisaTool,
    cryptoPaymentTool,
    qiwiPaymentTool,
    saneVisaPaymentTool,
    CryptoWalletData
} from '../../api/capi-v2';
import {
    ClientInfo,
    PaymentResource,
    PaymentTerminalDetails,
    PaymentToolDetails,
    PaymentToolDetailsBankCard,
    PaymentToolDetailsDigitalWallet,
    TokensApiFp,
    LogicError,
    PaymentResourceParams
} from '../../api/capi-v2/codegen';
import { secureVisaPaymentTool } from '../../api/capi-v2/params';
import { secureEmptyCVVVisaPaymentTool } from '../../api/capi-v2/params';
import { CAPIDispatcher } from '../../utils/codegen-utils';
import DigitalWalletDetailsType = PaymentToolDetailsDigitalWallet.DigitalWalletDetailsTypeEnum;

chai.should();

export class TokensActions {
    private api;
    private dispatcher: CAPIDispatcher;

    constructor(accessToken: string) {
        this.dispatcher = new CAPIDispatcher({});
        this.api = TokensApiFp({
            apiKey: `Bearer ${accessToken}`
        });
    }

    createPaymentResource(paymentTool: PaymentResourceParams): Promise<PaymentResource> {
        return this.dispatcher.callMethod(this.api.createPaymentResource, paymentTool);
    }

    createPaymentResourceError(paymentTool: PaymentResourceParams): Promise<LogicError> {
        return this.dispatcher
            .callMethod(this.api.createPaymentResource, paymentTool)
            .catch(error => {
                return error;
            });
    }

    createSaneVisaPaymentResource(): Promise<PaymentResource> {
        return this.dispatcher
            .callMethod(this.api.createPaymentResource, saneVisaPaymentTool)
            .then(resource => {
                this.assertPaymentResource(resource, {
                    cardNumberMask: '424242******4242',
                    last4: '4242',
                    first6: '424242',
                    detailsType: 'PaymentToolDetailsBankCard',
                    paymentSystem: 'visa'
                } as PaymentToolDetails);
                return resource;
            });
    }

    createInsufficientFundsVisaPaymentResource(): Promise<PaymentResource> {
        return this.dispatcher
            .callMethod(this.api.createPaymentResource, insufficientFundsVisaTool)
            .then(resource => {
                this.assertPaymentResource(resource, {
                    cardNumberMask: '400000******0002',
                    last4: '0002',
                    first6: '400000',
                    detailsType: 'PaymentToolDetailsBankCard',
                    paymentSystem: 'visa'
                } as PaymentToolDetails);
                return resource;
            });
    }

    createSecureVisaPaymentResource(): Promise<PaymentResource> {
        return this.dispatcher
            .callMethod(this.api.createPaymentResource, secureVisaPaymentTool)
            .then(resource => {
                this.assertPaymentResource(resource, {
                    cardNumberMask: '401288******1881',
                    last4: '1881',
                    first6: '401288',
                    detailsType: 'PaymentToolDetailsBankCard',
                    paymentSystem: 'visa'
                } as PaymentToolDetails);
                return resource;
            });
    }

    createSecureEmptyCVVVisaPaymentResource(): Promise<PaymentResource> {
        return this.dispatcher
            .callMethod(this.api.createPaymentResource, secureEmptyCVVVisaPaymentTool)
            .then(resource => {
                this.assertPaymentResource(resource, {
                    cardNumberMask: '401288******1881',
                    last4: '1881',
                    first6: '401288',
                    detailsType: 'PaymentToolDetailsBankCard',
                    paymentSystem: 'visa'
                } as PaymentToolDetails);
                return resource;
            });
    }

    createQIWIPaymentResource(): Promise<PaymentResource> {
        return this.dispatcher
            .callMethod(this.api.createPaymentResource, qiwiPaymentTool)
            .then(resource => {
                this.assertPaymentResource(resource, {
                    detailsType: 'PaymentToolDetailsDigitalWallet',
                    digitalWalletDetailsType: DigitalWalletDetailsType.DigitalWalletDetailsQIWI,
                    phoneNumberMask: '+7*****1111'
                } as PaymentToolDetails);
                return resource;
            });
    }

    createCryptoPaymentResource(): Promise<PaymentResource> {
        return this.dispatcher
            .callMethod(this.api.createPaymentResource, cryptoPaymentTool)
            .then(resource => {
                this.assertPaymentResource(resource, {
                    detailsType: 'PaymentToolDetailsCryptoWallet',
                    cryptoCurrency: 'bitcoinCash'
                } as PaymentToolDetails);
                return resource;
            });
    }

    private assertPaymentResource(
        resource: PaymentResource,
        assertionPaymentToolDetails: PaymentToolDetails
    ) {
        resource.should.to.have.property('paymentToolToken').to.be.a('string');
        resource.should.to.have.property('paymentSession').to.be.a('string');
        resource.should.to.have.property('clientInfo').to.be.a('object');
        resource.should.to.have.property('paymentToolDetails').to.be.a('object');
        const clientInfo = resource['clientInfo'] as ClientInfo; // TODO swagger multi inheritance bug
        clientInfo.should.to.have.property('fingerprint').to.be.a('string');
        clientInfo.should.to.have.property('ip').to.be.a('string');
        const paymentToolDetails = resource.paymentToolDetails;
        paymentToolDetails.should.to.deep.eq(assertionPaymentToolDetails);
    }
}
