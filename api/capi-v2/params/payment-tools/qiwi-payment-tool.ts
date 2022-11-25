import {
    DigitalWalletData,
    PaymentTool,
    PaymentResourceParams
} from '../../codegen';

export const qiwiPaymentTool = {
    paymentTool: {
        paymentToolType: PaymentTool.PaymentToolTypeEnum.DigitalWalletData,
        provider: 'qiwi',
        id: '+7911111111'
    } as DigitalWalletData,
    clientInfo: {
        fingerprint: '71aadcee86e140f794924855f5e48aa9'
    }
} as PaymentResourceParams;
