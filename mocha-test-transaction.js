const path = require('path');
const settings = require('./build/settings');

const mocha = settings.setup(process.argv);

const testTransactionFile = 'transaction.spec.js';

mocha
    .addFile(path.join(settings.testDir, testTransactionFile))
    .reporter('min')
    .run(code => (process.exit(code === 1 ? 3 : code)));
