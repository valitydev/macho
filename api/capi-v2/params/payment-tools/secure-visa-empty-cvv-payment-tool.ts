import { CardData, PaymentTool, PaymentResourceParams } from '../../codegen';

export const secureEmptyCVVVisaPaymentTool = {
    paymentTool: {
        paymentToolType: PaymentTool.PaymentToolTypeEnum.CardData,
        cardNumber: '4012888888881881',
        expDate: '12/20',
        cardHolder: 'LEXA SVOTIN'
    } as CardData,
    clientInfo: {
        fingerprint: '316a2eee53ea181b3deecb70691021ce'
    }
} as PaymentResourceParams;
