import request = require('request');
import http = require('http');
import { PapiForTests } from './papi-for-tests';
import { Payout } from './payout';
import * as chai from 'chai';
import { Authentication } from './authentication';
import { VoidAuth } from './void-auth';
import { ApiKeyAuth } from './api-key-auth';
import { ClaimsApiApiKeys } from './claims-api-api-keys';
import { handleResponseError } from '../../utils';

chai.should();

export class PayoutsApiForTests implements PapiForTests {
    public defaultHeaders: any = {};
    public basePath: string = '';
    public useQuerystring: boolean = false;

    protected authentications = {
        default: <Authentication>new VoidAuth(),
        bearer: new ApiKeyAuth('header', 'Authorization')
    };

    constructor(basePath: string) {
        this.basePath = basePath;
    }

    private getDefaultHeaders() {
        const headers = new Headers();
        headers.append('Content-type', 'application/json; charset=UTF-8');
        headers.append('Authorization', this.authentications.bearer.apiKey);
        return headers;
    }

    public setDefaultAuthentication(auth: Authentication) {
        this.authentications.default = auth;
    }

    public setApiKey(key: ClaimsApiApiKeys, value: string) {
        this.authentications[ClaimsApiApiKeys[key]].apiKey = value;
    }

    public pay(payoutIds: string[]) {
        const params = {
            method: 'POST',
            headers: this.getDefaultHeaders(),
            body: JSON.stringify({ payoutIds })
        };
        return fetch(`${this.basePath}/payouts/pay`, params)
            .then(response => {
                if (response.status === 200) {
                    return response;
                } else {
                    return handleResponseError(response);
                }
            })
            .catch(ex => handleResponseError(ex));
    }

    public confirmPayouts(payoutIds: string[]) {
        const params = {
            method: 'POST',
            headers: this.getDefaultHeaders(),
            body: JSON.stringify({ payoutIds })
        };
        return fetch(`${this.basePath}/payouts/confirm`, params)
            .then(response => {
                if (response.status === 200) {
                    return response;
                } else {
                    return handleResponseError(response);
                }
            })
            .catch(ex => handleResponseError(ex));
    }

    public searchPayoutsForTests(fromTime?: Date, toTime?: Date): Promise<Payout[]> {
        return this.searchPayouts(fromTime, toTime)
            .then(http => {
                const response = http.response;
                response.statusCode.should.eq(200);
                return http.body.payouts;
            })
            .catch(ex => handleResponseError(ex));
    }

    public searchPayouts(
        fromTime?: Date,
        toTime?: Date
    ): Promise<{ response: http.ClientResponse; body: any }> {
        const localVarPath = this.basePath + '/payouts';
        let queryParameters: any = {};
        let headerParams: any = (<any>Object).assign({}, this.defaultHeaders);
        let formParams: any = {};

        if (fromTime !== undefined) {
            queryParameters['fromTime'] = fromTime;
        }

        if (toTime !== undefined) {
            queryParameters['toTime'] = toTime;
        }

        let useFormData = false;

        let requestOptions: request.Options = {
            method: 'GET',
            qs: queryParameters,
            headers: headerParams,
            uri: localVarPath,
            useQuerystring: this.useQuerystring,
            json: true
        };

        this.authentications.bearer.applyToRequest(requestOptions);

        this.authentications.default.applyToRequest(requestOptions);

        if (Object.keys(formParams).length) {
            if (useFormData) {
                (<any>requestOptions).formData = formParams;
            } else {
                requestOptions.form = formParams;
            }
        }
        return new Promise<{ response: http.ClientResponse; body: any }>((resolve, reject) => {
            request(requestOptions, (error, response, body) => {
                if (error) {
                    reject(error);
                } else {
                    if (response.statusCode >= 200 && response.statusCode <= 299) {
                        resolve({ response: response, body: body });
                    } else {
                        reject({ response: response, body: body });
                    }
                }
            });
        });
    }
}
