import * as yargs from 'yargs';
require('dotenv').config();

export const authEndpoint = yargs.argv['auth-endpoint'] || process.env.AUTH_ENDPOINT;
export const capiEndpoint = yargs.argv['capi-endpoint'] || process.env.CAPI_ENDPOINT;
export const adminEndpoint = yargs.argv['admin-endpoint'] || process.env.ADMIN_ENDPOINT;
export const proxyEndpoint = yargs.argv['proxy-endpoint'] || process.env.PROXY_ENDPOINT;
export const urlShortenerEndpoint =
    yargs.argv['url-shortener-endpoint'] || process.env.URL_SHORTENER_ENDPOINT;
export const externalLogin = yargs.argv['external-login'] || process.env.EXTERNAL_LOGIN;
export const externalPassword = yargs.argv['external-password'] || process.env.EXTERNAL_PASSWORD;
export const internalLogin = yargs.argv['internal-login'] || process.env.INTERNAL_LOGIN;
export const internalPassword = yargs.argv['internal-password'] || process.env.INTERNAL_PASSWORD;
export const wapiEndpoint = capiEndpoint + '/wallet';
export const privdocEndpoint = capiEndpoint + '/privdoc';
export const payresEndpoint = capiEndpoint + '/payres';
export const anapiEndpoint = capiEndpoint + '/lk';
export const binapiEndpoint = capiEndpoint + '/binbase';
export const testWebhookReceiverInternal = 'http://test-webhook-receiver:8080';
export const testWebhookReceiverEndpoint =
    yargs.argv['test-webhook-receiver-endpoint'] || process.env.TEST_WEBHOOK_RECEIVER_ENDPOINT;
