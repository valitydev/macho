const path = require('path');
const settings = require('./build/settings');
const glob = require('glob');

const { mocha, args } = settings.setup(process.argv);

if (args['file']) {
    mocha.addFile(path.resolve(args['file']));
} else {
    glob.sync('**/*.js', { cwd: "./build/test/" })
        .forEach(file => mocha.addFile(path.resolve("./build/test/", file)));
}

mocha
    .reporter('spec')
    .run(code => process.exit(code));
