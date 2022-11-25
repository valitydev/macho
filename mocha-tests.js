const settings = require('./build/settings');

const mocha = settings.setup(process.argv);

mocha
    .reporter('spec')
    .run(code => process.exit(code));
