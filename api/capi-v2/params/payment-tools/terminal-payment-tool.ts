import { PaymentTerminalData, PaymentTool, PaymentResourceParams } from '../../codegen';
import { PaymentTerminalDetails } from '../../';
import ProviderEnum = PaymentTerminalDetails.ProviderEnum;

export const terminalPaymentTool = {
    paymentTool: {
        paymentToolType: PaymentTool.PaymentToolTypeEnum.PaymentTerminalData,
        provider: ProviderEnum.Euroset
    } as PaymentTerminalData,
    clientInfo: {
        fingerprint: '316a2eee53ea181b3deecb70691021ce'
    }
} as PaymentResourceParams;
