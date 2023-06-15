import Mocha from 'mocha';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import url from 'url';
import glob from 'glob';
import axios, {
    AxiosError,
    AxiosDefaults,
    AxiosRequestConfig,
    AxiosResponse
} from 'axios';
import { RequestInit, Response } from 'node-fetch';
import path from 'path';

export var authEndpoint: string;
export var authEndpointHost: string;
export var adminEndpoint: string;
export var proxyEndpoint: string;
export var urlShortenerEndpoint: string;
export var externalLogin: string;
export var externalPassword: string;
export var internalLogin: string;
export var internalPassword: string;
export var capiEndpoint: string;
export var wapiEndpoint: string;
export var payresEndpoint: string;
export var claimManagementEndpoint: string;
export var claimAdminEndpoint: string;
export var anapiEndpoint: string;
export var binapiEndpoint: string;
export var testWebhookReceiverInternal: string;
export var testWebhookReceiverEndpoint: string;

export var createTestShop: boolean;
export var testPartyID: string;
export var testDir: string;
export var verbose: boolean;

export const fetch = (url: string, options: RequestInit) => {
    return axios.request({
        url,
        method: options.method,
        headers: options.headers as Record<string, string>,
        data: options.body,
        responseType: 'json',
        // validateStatus: () => true,
        timeout: options.timeout,
        maxBodyLength: options.size,
        maxRedirects: options.follow,
        beforeRedirect: options.redirect == 'error'
            ? () => { throw new Error('Redirect requested'); }
            : undefined,
    })
        .then((response: AxiosResponse<JSON>) => {
            return Object.assign(response, {
                json: () => response.data
            });
        });
};

const formatAxiosRequest = (config: AxiosDefaults | AxiosRequestConfig): string => {
    var format = ` >>>\r\n`;
    format += ` >>> ${config.method.toUpperCase()} ${config.url}\r\n`;
    format += ` >>>\r\n`;
    const headers = (config as AxiosDefaults).headers;
    for (const name in headers) {
        if (typeof config.headers[name] === 'string') {
            format += ` > ${name}: ${config.headers[name]}\r\n`;
        }
    }
    if (typeof headers[config.method] === 'object') {
        for (const name in headers[config.method]) {
            format += ` > ${name}: ${headers[config.method][name]}\r\n`;
        }
    }
    if (typeof headers.common === 'object') {
        for (const name in headers.common) {
            format += ` > ${name}: ${headers.common[name]}\r\n`;
        }
    }
    if (config.data) {
        format += ' >\r\n';
        format += ` > ${config.data}\r\n`;
    }
    return format;
}

const formatAxiosResponse = (response: AxiosResponse): string => {
    var format = ` <<<\r\n`;
    format += ` <<< ${response.status} ${response.statusText}\r\n`;
    format += ` <<<\r\n`;
    for (const name in response.headers) {
        format += ` < ${name}: ${response.headers[name]}\r\n`;
    }
    format += ' <\r\n';
    if (typeof response.data === 'object') {
        format += ` < ${JSON.stringify(response.data)}\r\n`;
    }
    return format;
}

const enrichAxiosError = (error: AxiosError): void => {
    error.message += '\r\n';
    error.message += formatAxiosRequest(error.config);
    error.message += '\r\n';
    if (error.response) {
        error.message += formatAxiosResponse(error.response);
    }
}

export const setup = (argv: string[]): { mocha: Mocha, args: Record<string, any> } => {

    const args = yargs(hideBin(argv))
        .usage('Usage: $0 [options]')
        .describe('auth-endpoint', 'Auth endpoint')
        .describe('external-login', 'External realm account login')
        .describe('external-password', 'External realm account password')
        .describe('internal-login', 'Internal realm account login')
        .describe('internal-password', 'Internal realm account password')
        .describe('api-endpoint', 'Root API endpoint')
        .describe('admin-endpoint', 'IDDQD endpoint')
        .describe('proxy-endpoint', 'Proxy endpoint')
        .describe('url-shortener-endpoint', 'URL Shortener API endpoint')
        .describe('test-webhook-receiver-endpoint', 'Test webhook receiver endpoint')
        .describe('file', 'include a file to be ran during the suite [filepath]')
        .describe('slow', '"slow" test threshold in ms')
        .describe('timeout', 'Set test-case timeout in ms')
        .describe('test-dir', 'Path to directory containng tests')
        .describe('verbose', 'Output more progress information, like HTTP traces')
        .describe('auth-warn', 'Auth flow warn threshold in ms')
        .describe('create-invoice-warn', 'Create invoice warn threshold in ms')
        .describe('create-payment-resource-warn', 'Create payment resource warn threshold in ms')
        .describe('create-payment-warn', 'Create payment warn threshold in ms')
        .describe('polling-warn', 'Polling payment and invoice events warn threshold in ms')
        .describe('fulfill-invoice-warn', 'Fulfill invoice warn threshold in ms')
        .describe('test-shop-id', 'Test shopID for test transaction')
        .describe('test-party-id', 'Test partyID for test')
        .describe('create-test-shop', 'Create test shop if not found')
        .env('MOCHA')
        .boolean('verbose')
        .default({
            'verbose': false,
            'timeout': 30000,
            'slow': 150,
            'auth-warn': 200,
            'create-invoice-warn': 200,
            'create-payment-resource-warn': 200,
            'create-payment-warn': 200,
            'polling-warn': 5000,
            'fulfill-invoice-warn': 100,
            'test-shop-id': 'TEST',
            'create-test-shop': true,
            'test-dir': './build/test'
        })
        .demandOption([
            'auth-endpoint',
            'external-login',
            'external-password',
            // 'internal-login',
            // 'internal-password',
            'api-endpoint',
            'admin-endpoint',
            // 'proxy-endpoint',
            // 'url-shortener-endpoint',
            // 'test-webhook-receiver-endpoint'
        ]).argv;

    const apiEndpoint = args['api-endpoint'];

    authEndpoint = args['auth-endpoint'];
    authEndpointHost = url.parse(authEndpoint).host;
    adminEndpoint = args['admin-endpoint'];
    proxyEndpoint = args['proxy-endpoint'];
    urlShortenerEndpoint = args['url-shortener-endpoint'];
    externalLogin = args['external-login'];
    externalPassword = args['external-password'];
    internalLogin = args['internal-login'];
    internalPassword = args['internal-password'];
    capiEndpoint = apiEndpoint;
    wapiEndpoint = apiEndpoint + '/wallet';
    payresEndpoint = apiEndpoint + '/payres';
    claimManagementEndpoint = apiEndpoint + '/claim-api';
    anapiEndpoint = apiEndpoint + '/anapi';
    binapiEndpoint = apiEndpoint + '/binbase';
    claimAdminEndpoint = adminEndpoint + '/v1/cm';
    testWebhookReceiverInternal = 'http://test-webhook-receiver:8080';
    testWebhookReceiverEndpoint = args['test-webhook-receiver-endpoint'];

    createTestShop = args['create-test-shop'];
    testPartyID = args['test-party-id'];
    testDir = args['test-dir'];
    verbose = args['verbose'];

    axios.interceptors.request.use(
        (config: AxiosRequestConfig) => {
            verbose && console.log(formatAxiosRequest(config));
            return config;
        }
    );

    axios.interceptors.response.use(
        (response: AxiosResponse) => {
            verbose && console.log(formatAxiosResponse(response));
            return response;
        },
        (error: AxiosError) => {
            verbose && console.log(formatAxiosResponse(error.response));
            if (error.isAxiosError === true) {
                enrichAxiosError(error);
            }
            return Promise.reject(error);
        }
    );

    const mocha = new Mocha({
        timeout: args['timeout'],
        slow: args['slow']
    });
    
    return { args, mocha };

};
