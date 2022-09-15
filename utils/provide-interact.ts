import request = require('request');
import {
    BrowserGetRequest,
    BrowserPostRequest,
    PaymentInteractionRequested,
    Redirect
} from '../api/capi-v2';
import { deserialize } from './uri-serializer';
import { proxyEndpoint } from '../settings';

function processPostRequest({ form }: BrowserPostRequest): Promise<void> {
    return new Promise((resolve, reject) => {
        request.post(
            {
                url: `${proxyEndpoint}/mocketbank/term_url?termination_uri=null`,
                form: form.reduce(
                    (r, { key, template }) => (key === 'MD' ? { ...r, MD: template } : r),
                    { PaRes: 'PaRes' }
                )
            },
            (err, { statusCode }) => {
                if (err) {
                    reject(err);
                } else {
                    statusCode.should.eq(302);
                    resolve();
                }
            }
        );
    });
}

function uriToForm(uriTemplate: string): object {
    const obj = deserialize(uriTemplate);
    return {
        bill_id: obj.transaction,
        success_url: obj.success_url,
        fail_url: obj.fail_url,
        callback_url: obj.callback_url,
        amount: obj.amount,
        user: obj.user,
        status: 'paid',
        command: 'bill',
        ccy: 'RUB',
        error: '0',
        prv_name: 'Test',
        comment: 'Test product'
    };
}

function processGetRequest({ uriTemplate }: BrowserGetRequest): Promise<void> {
    return new Promise((resolve, reject) => {
        request.post(
            {
                url: `${proxyEndpoint}/base/confirm_invoice`,
                form: uriToForm(uriTemplate)
            },
            (err, { statusCode }) => {
                if (err) {
                    reject(err);
                } else {
                    statusCode.should.eq(302);
                    resolve();
                }
            }
        );
    });
}

export function provideInteract({ userInteraction }: PaymentInteractionRequested): Promise<void> {
    const browserRequest = (userInteraction as Redirect).request;
    switch (browserRequest.requestType) {
        case 'BrowserPostRequest':
            return processPostRequest(browserRequest as BrowserPostRequest);
        case 'BrowserGetRequest':
            return processGetRequest(browserRequest as BrowserGetRequest);
    }
}
