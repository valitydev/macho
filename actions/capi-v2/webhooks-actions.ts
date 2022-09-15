import * as chai from 'chai';
import { InvoicesTopic, Webhook, WebhooksApiFp, WebhookScope } from '../../api/capi-v2/codegen';
import { AuthActions } from '../auth-actions';
import { countEvents, getEvents, webhookParams } from '../../api/capi-v2/params';
import { CAPIDispatcher } from '../../utils/codegen-utils';

chai.should();

export class WebhooksActions {
    private api;
    private dispatcher: CAPIDispatcher;
    private static instance: WebhooksActions;

    static async getInstance(): Promise<WebhooksActions> {
        if (this.instance) {
            return this.instance;
        }
        const token = await AuthActions.getInstance().getExternalAccessToken();
        this.instance = new WebhooksActions(token);
        return this.instance;
    }

    private constructor(exToken: string) {
        this.dispatcher = new CAPIDispatcher({});
        this.api = WebhooksApiFp({
            apiKey: `Bearer ${exToken}`
        });
    }

    async createWebhook(
        shopID: string = 'TEST',
        testId: string,
        eventTypes: Array<InvoicesTopic.EventTypesEnum>
    ): Promise<Webhook> {
        return this.dispatcher
            .callMethod(
                this.api.createWebhook,
                webhookParams(
                    {
                        topic: WebhookScope.TopicEnum.InvoicesTopic,
                        shopID: shopID,
                        eventTypes: eventTypes
                    } as InvoicesTopic,
                    testId
                )
            )
            .then(webhook => {
                webhook.should.to.have.property('active').to.eq(true);
                return webhook;
            });
    }

    countEvents(testId: string): Promise<number> {
        return countEvents(testId);
    }

    getEvents(testId: string): Promise<string> {
        return getEvents(testId);
    }
}
