const Mocha = require('mocha');
const path = require('path');
const glob = require('glob');

const argv = require('yargs')
    .usage('Usage: $0 [options]')
    .describe('auth-endpoint', 'Auth endpoint')
    .describe('external-login', 'Auth external realm login')
    .describe('external-password', 'Auth external realm password')
    .describe('internal-login', 'Auth internal realm login')
    .describe('internal-password', 'Auth internal realm password')
    .describe('capi-endpoint', 'Common API endpoint')
    .describe('admin-endpoint', 'IDDQD endpoint')
    .describe('proxy-endpoint', 'Proxy endpoint')
    .describe('url-shortener-endpoint', 'URL Shortener API endpoint')
    .describe('test-webhook-receiver-endpoint', 'Test webhook receiver endpoint')
    .describe('file', 'include a file to be ran during the suite [filepath]')
    .describe('slow', '"slow" test threshold in ms')
    .describe('timeout', 'Set test-case timeout in ms')
    .describe('tt', 'Test transaction flag')
    .describe('test-dir', 'Path to directory containng tests')
    .describe('auth-warn', 'Auth flow warn threshold in ms')
    .describe('create-invoice-warn', 'Create invoice warn threshold in ms')
    .describe('create-payment-resource-warn', 'Create payment resource warn threshold in ms')
    .describe('create-payment-warn', 'Create payment warn threshold in ms')
    .describe('polling-warn', 'Polling payment and invoice events warn threshold in ms')
    .describe('fulfill-invoice-warn', 'Fulfill invoice warn threshold in ms')
    .describe('test-shop-id', 'Test shopID for test transaction')
    .describe('create-test-shop', 'Create test shop if not found')
    .default({
        timeout: 30000,
        slow: 150,
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
        'internal-login',
        'internal-password',
        'capi-endpoint',
        'admin-endpoint',
        'proxy-endpoint',
        'url-shortener-endpoint',
        'test-webhook-receiver-endpoint'
    ]).argv;

const mocha = new Mocha({
    timeout: argv.timeout,
    slow: argv.slow
});

const testDir = argv['test-dir'];
const integrationTestFile = 'transaction.spec.js';

if (argv.file) {
    mocha.addFile(path.resolve(argv.file));
} else {
    glob.sync('**/*.js', { cwd: testDir })
        .filter(file => (argv.tt ? file === integrationTestFile : file !== integrationTestFile))
        .forEach(file => mocha.addFile(path.resolve(testDir, file)));
}

mocha
    .reporter(argv.tt ? 'min' : 'spec')
    .run(code => (argv.tt ? process.exit(code === 1 ? 3 : code) : process.exit(code)));
