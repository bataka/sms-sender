var argv = require('minimist')(process.argv.slice(2));

var envs = {
    dev: 'dev',
    developer: 'dev',
    prod: 'prod',
    production: 'prod'
};

var env = argv.env || envs.prod, config;

if (env in envs) {

    config = require('./config.' + env);
    console.log('loaded config.' + env);

} else throw new Error('not allowed env. allowed env`s=[developer,production]');

module.exports = config;