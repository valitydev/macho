import { CardData, PaymentTool, PaymentResourceParams } from '../../codegen';

export const insufficientFundsVisaTool = {
    paymentTool: {
        paymentToolType: PaymentTool.PaymentToolTypeEnum.CardData,
        cardNumber: '4000000000000002',
        expDate: '12/29',
        cvv: '123',
        cardHolder: 'LEXA SVOTIN'
    } as CardData,
    clientInfo: {
        fingerprint: '316a2eee53ea181b3deecb70691021ce'
    }
} as PaymentResourceParams;
