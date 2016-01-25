var foduler = require('foduler');

module.exports = foduler.module('sms.router').as('sr')
    .factory('sms-base router', ['$web:routerFactory',
        function (routerFactory) {
            return routerFactory('/');
        }
    ])

    .factory('service', require('./service'))
    .factory('template', require('./template'))

    .factory('routers', ['service', 'template']);