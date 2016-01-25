var foduler = require('foduler');
var config = require('./config');

var sms = foduler.module('sms')
    .include(require('foduler/module-web'))
    .include(require('./service'))
    .include(require('./routes'))
    .include(require('./model'))

    .factory('config', function () {
        return config;
    })

    .config(['$web:express', '$web:app',// static assets
        function (express, app) {
            app.use('/doc', express.static(__dirname + '/doc'));
            app.use('/out', express.static(__dirname + '/out'));
        }
    ])
    .config(['$web:app', '$web:promise-express',// promise express
        function (app, promiseExpress) {
            app.use(promiseExpress);
        }
    ])

    .on('postRun', ['sr:routers', '$web:app',

        function (routers, app) {

            app.use(function (req, res, next) {
                var err = new Error('Not Found. request path=' + req.path);
                err.status = 404;
                next(err);
            });

            app.use(function (err, req, res, next) {

                res.status(err.status || 500);
                res.json({
                    message: err.message,
                    error: err
                });
            });


            app.listen(process.env.NODE_PORT || 3100, function () {
                var port = this.address().port;
                console.log('`%s` starting. use port:%s', sms.$name, port);
            });
        }
    ]);

foduler.start(sms);