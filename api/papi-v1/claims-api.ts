import request = require('request');
import http = require('http');
import * as chai from 'chai';
import guid from '../../utils/guid';
import { PapiForTests } from './papi-for-tests';
import { Authentication } from './authentication';
import { VoidAuth } from './void-auth';
import { ApiKeyAuth } from './api-key-auth';
import { ClaimsApiApiKeys } from './claims-api-api-keys';
import { handleResponseError } from '../../utils';

chai.should();

export class ClaimsApiForTests implements PapiForTests {
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

    public setDefaultAuthentication(auth: Authentication) {
        this.authentications.default = auth;
    }

    public setApiKey(key: ClaimsApiApiKeys, value: string) {
        this.authentications[ClaimsApiApiKeys[key]].apiKey = value;
    }

    acceptClaimByIDForTests(
        partyID: string,
        claimID: number,
        claimRevision: number
    ): Promise<void> {
        return this.acceptClaimByID(guid(), partyID, claimID, claimRevision)
            .then(result => {
                const response = result.response;
                response.statusCode.should.eq(200);
                return;
            })
            .catch(ex => handleResponseError(ex));
    }

    private acceptClaimByID(
        xRequestID: string,
        partyID: string,
        claimID: number,
        claimRevision: number
    ): Promise<{ response: http.ClientResponse; body?: any }> {
        const localVarPath = this.basePath + '/walk/claim/accept';
        let queryParameters: any = {};
        let headerParams: any = (<any>Object).assign({}, this.defaultHeaders);
        let formParams: any = {};

        // verify required parameter 'xRequestID' is not null or undefined
        if (xRequestID === null || xRequestID === undefined) {
            throw new Error(
                'Required parameter xRequestID was null or undefined when calling acceptClaimByID.'
            );
        }

        // verify required parameter 'partyID' is not null or undefined
        if (partyID === null || partyID === undefined) {
            throw new Error(
                'Required parameter partyID was null or undefined when calling acceptClaimByID.'
            );
        }

        // verify required parameter 'claimID' is not null or undefined
        if (claimID === null || claimID === undefined) {
            throw new Error(
                'Required parameter claimID was null or undefined when calling acceptClaimByID.'
            );
        }

        // verify required parameter 'claimRevision' is not null or undefined
        if (claimRevision === null || claimRevision === undefined) {
            throw new Error(
                'Required parameter claimRevision was null or undefined when calling acceptClaimByID.'
            );
        }

        headerParams['X-Request-ID'] = xRequestID;

        let useFormData = false;

        let requestOptions: request.Options = {
            method: 'POST',
            qs: queryParameters,
            headers: headerParams,
            uri: localVarPath,
            useQuerystring: this.useQuerystring,
            json: true,
            body: {
                claimId: claimID,
                partyId: partyID,
                revision: claimRevision
            }
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
        return new Promise<{ response: http.ClientResponse; body?: any }>((resolve, reject) => {
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
