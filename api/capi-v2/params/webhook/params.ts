import { Webhook, WebhookScope } from '../../codegen';
import * as request from 'request';
import { testWebhookReceiverEndpoint, testWebhookReceiverInternal } from '../../../../settings';

export function webhookParams(scope: WebhookScope, testId: string): Webhook {
    return {
        scope: scope,
        url: `${testWebhookReceiverInternal}/hooker/${testId}`
    } as Webhook;
}

export function getEvents(testId: string): Promise<string> {
    return new Promise((resolve, reject) => {
        request.get(
            {
                url: `${testWebhookReceiverEndpoint}/search/get/${testId}`
            },
            (err, response) => {
                if (err) {
                    reject(err);
                } else {
                    response.statusCode.should.eq(200);
                    resolve(response.body);
                }
            }
        );
    });
}

export function countEvents(testId: string): Promise<number> {
    return new Promise((resolve, reject) => {
        request.get(
            {
                url: `${testWebhookReceiverEndpoint}/search/count/${testId}`
            },
            (err, response) => {
                if (err) {
                    reject(err);
                } else {
                    response.statusCode.should.eq(200);
                    resolve(JSON.parse(response.body).count);
                }
            }
        );
    });
}
