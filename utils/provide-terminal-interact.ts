import { ProxyApiForTests } from '../api/proxy-api';
import { InvoicesEventActions, isInvoiceInteracted } from '../actions/capi-v2';

export function provideTerminalInteract(
    invoiceID: string,
    amount: number,
    invoiceEventActions: InvoicesEventActions,
    proxyApiForTests: ProxyApiForTests
): Promise<void> {
    return invoiceEventActions.waitConditions([isInvoiceInteracted()], invoiceID).then(event =>
        // @ts-ignore
        proxyApiForTests.payTerminalPayment(event[0].userInteraction.shortPaymentID, amount)
    );
}
