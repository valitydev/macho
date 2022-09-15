import { CardData, PaymentTool, PaymentResourceParams } from '../../codegen';

export const saneVisaPaymentTool = {
    paymentTool: {
        paymentToolType: PaymentTool.PaymentToolTypeEnum.CardData,
        cardNumber: '4242424242424242',
        expDate: '12/20',
        cvv: '123',
        cardHolder: 'LEXA SVOTIN'
    } as CardData,
    clientInfo: {
        fingerprint: '316a2eee53ea181b3deecb70691021ce'
    }
} as PaymentResourceParams;
