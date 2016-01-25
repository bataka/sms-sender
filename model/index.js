var foduler = require('foduler');
var Sequelize = require('sequelize');

module.exports = foduler.module('models')
    .value('Sequelize', Sequelize)
    .factory('sequelize instance', ['sms:config',
        function (config) {
            return new Sequelize(config.db.database, config.db.user, config.db.password, {
                host: config.db.host,
                port: config.db.port,
                dialect: 'mysql',
                pool: config.db.pool
            });
        }
    ])
    .factory('model Sms', require('./sms'))
    .factory('model Template', require('./template'))
    .factory('model', ['model Sms', 'model Template',
        function (Sms, Template) {
            return {
                Sms: Sms,
                Template: Template
            };
        }
    ])
    .run(['sequelize instance',
        function (sequelize) {
            sequelize.sync().then(function () {

            });
        }
    ]);



