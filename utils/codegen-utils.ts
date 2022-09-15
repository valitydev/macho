import guid from './guid';
import { capiEndpoint, payresEndpoint, privdocEndpoint, wapiEndpoint } from '../settings';
import { handleResponseError } from './handle-response-error';

import * as merge from  'lodash/merge';

const defaultOptions = {
    headers: {
        'Content-Type': 'application/json; charset=utf-8'
    }
};

export class APIDispatcher {
    private endpoint: string;
    private requestOptions: any;

    constructor(endpoint: string, requestOptions: any = {}) {
        this.endpoint = endpoint;
        let options = {};
        merge(options, defaultOptions, requestOptions);
        this.requestOptions = options;
    }

    callMethod<R = any>(fn: (...args: any[]) => Promise<R>, ...args: any[]): Promise<R> {
        const xRequestID = guid();
        return fn
            .apply(null, [xRequestID, ...args, this.requestOptions])(undefined, this.endpoint)
            .catch(ex => handleResponseError(ex, xRequestID));
    }
}

export class CAPIDispatcher extends APIDispatcher {
    constructor(requestOptions?: any) {
        super(`${capiEndpoint}/v2`, requestOptions);
    }

    callMethod<R = any>(fn: (...args: any[]) => Promise<R>, ...args: any[]): Promise<R> {
        // Every CAPI method has a xRequestDeadline as last argument
        return super.callMethod(fn, ...args, undefined);
    }
}

export class WAPIDispatcher extends APIDispatcher {
    constructor(requestOptions?: any) {
        super(`${wapiEndpoint}/v0`, requestOptions);
    }
}
export class WapiPrivdocDispatcher extends APIDispatcher {
    constructor(requestOptions?: any) {
        super(`${privdocEndpoint}/v0`, requestOptions);
    }
}

export class WapiPayresDispatcher extends APIDispatcher {
    constructor(requestOptions?: any) {
        super(`${payresEndpoint}/v0`, requestOptions);
    }
}
