const path = require('path');
const settings = require('./build/settings');

const { mocha, args } = settings.setup(process.argv);

if (args['file']) {
    mocha.addFile(path.resolve(args['file']));
} else {
    glob.sync('**/*.js', { cwd: testDir })
        .forEach(file => mocha.addFile(path.resolve(testDir, file)));
}

mocha
    .reporter('spec')
    .run(code => process.exit(code));
