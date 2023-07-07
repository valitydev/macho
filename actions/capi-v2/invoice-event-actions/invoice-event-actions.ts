import { InvoiceEvent, InvoicesApiFp } from '../../../api/capi-v2/codegen';
import { CAPIDispatcher } from '../../../utils/codegen-utils';
import { EventActions } from '../../event-actions';
import { AuthActions } from '../../auth-actions';

export class InvoicesEventActions extends EventActions {
    private static instance: InvoicesEventActions;
    private dispatcher: CAPIDispatcher;

    static async getInstance(): Promise<InvoicesEventActions> {
        if (this.instance) {
            return this.instance;
        }
        const token = await AuthActions.getInstance().getExternalAccessToken();
        this.instance = new InvoicesEventActions(token);
        return this.instance;
    }

    constructor(accessToken: string) {
        super();
        this.dispatcher = new CAPIDispatcher({
            headers: {
                origin: 'https://dashboard.stage.empayre.com'
            }
        });
        this.api = InvoicesApiFp({
            apiKey: `Bearer ${accessToken}`
        });
    }

    async getEvents(invoiceID: string, limit: number = 1000, after?: number): Promise<InvoiceEvent[]> {
        return await this.dispatcher.callMethod(
            this.api.getInvoiceEvents,
            invoiceID,
            limit,
            undefined,
            after
        );
    }
}
