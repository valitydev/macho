import {
    DigitalWalletData,
    DigitalWalletQIWI,
    PaymentTool,
    PaymentResourceParams
} from '../../codegen';

export const qiwiPaymentTool = {
    paymentTool: {
        paymentToolType: PaymentTool.PaymentToolTypeEnum.DigitalWalletData,
        digitalWalletType: DigitalWalletData.DigitalWalletTypeEnum.DigitalWalletQIWI,
        phoneNumber: '+7911111111'
    } as DigitalWalletQIWI,
    clientInfo: {
        fingerprint: '71aadcee86e140f794924855f5e48aa9'
    }
} as PaymentResourceParams;
