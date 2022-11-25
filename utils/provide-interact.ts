import fetch from 'node-fetch';
import {
    BrowserGetRequest,
    BrowserPostRequest,
    PaymentInteractionRequested,
    Redirect
} from '../api/capi-v2';
import { deserialize } from './uri-serializer';
import { proxyEndpoint } from '../settings';

function processPostRequest({ form }: BrowserPostRequest): Promise<void> {
    let body = new URLSearchParams({PaRes: 'PaRes'});
    form.forEach(value => {
        if (value.key === 'MD') {
            body.append('MD', value.template);
        }
    });
    return fetch(`${proxyEndpoint}/mocketbank/term_url?termination_uri=null`, {
        method: 'POST',
        body: body,
        redirect: 'manual'
    })
        .then(response => {
            response.status.should.eq(302);
        });
}

function uriToForm(uriTemplate: string): URLSearchParams {
    const obj = deserialize(uriTemplate);
    return new URLSearchParams({
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
    });
}

function processGetRequest({ uriTemplate }: BrowserGetRequest): Promise<void> {
    return fetch(`${proxyEndpoint}/base/confirm_invoice`, {
        method: 'POST',
        body: uriToForm(uriTemplate)
    })
        .then(response => {
            response.status.should.eq(302);
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
