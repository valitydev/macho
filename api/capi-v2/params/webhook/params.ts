import { Webhook, WebhookScope } from '../../codegen';
import fetch from 'node-fetch';
import { testWebhookReceiverEndpoint, testWebhookReceiverInternal } from '../../../../settings';

export function webhookParams(scope: WebhookScope, testId: string): Webhook {
    return {
        scope: scope,
        url: `${testWebhookReceiverInternal}/hooker/${testId}`
    } as Webhook;
}

export function getEvents(testId: string): Promise<string> {
    return fetch(`${testWebhookReceiverEndpoint}/search/get/${testId}`)
        .then(response => {
                response.status.should.eq(200);
                return response.text();
            });
}

export function countEvents(testId: string): Promise<number> {
    return fetch(`${testWebhookReceiverEndpoint}/search/count/${testId}`)
        .then(response => {
            response.status.should.eq(200);
            return response.json().then(body => body['count']);
        });
}
