import { CryptoWalletData, PaymentTool, PaymentResourceParams } from '../../codegen';

export const cryptoPaymentTool = {
    paymentTool: {
        paymentToolType: PaymentTool.PaymentToolTypeEnum.CryptoWalletData,
        cryptoCurrency: 'bitcoinCash'
    } as CryptoWalletData,
    clientInfo: {
        fingerprint: 'dc8280558372bd072521cff0f178aa1c'
    }
} as PaymentResourceParams;
