var foduler = require('foduler');
var Swig = require('swig');

module.exports = foduler.module('sms-service').as('ss')
    .factory('config', [
        function () {
            var config = {
                debug: false,
                swig: {
                    autoescape: true,
                    varControls: ['[{', '}]'],
                    cmtControls: ['[#', '$]'],
                    tagControls: ['[%', '%]'],
                    cache: 'memory'
                }
            };

            var o = {
                get: function () {
                    return config;
                },
                debug: function (debug) {
                    config.debug = debug;
                }
            };
            return o;
        }
    ])
    .factory('renderTpl', ['config',
        function (configure) {
            var swig = false;

            function tpl(html, locals) {
                if (swig === false) {
                    swig = new Swig.Swig(configure.get().swig);
                }
                return swig.render(html, {locals: JSON.parse(locals)});
            }

            return function (html, locals) {
                return tpl(html, locals);
            };
        }
    ])
    .factory('smsMgr', ['models:model',
        function (Model) {
            return {
                find: function () {
                    return Model.Sms
                        .findOne({
                            where: {status: Model.Sms.statusEnums.pending},
                            order: 'level'
                        });
                }
            }
        }
    ])
    .factory('tplMgr', ['models:model',
        function (Model) {
            return {
                find: function (name) {
                    return Model.Template
                        .findOne({
                            where: {name: name}
                        });
                }
            }
        }
    ])
    .factory('smsSender', ['$lodash',
        function (_) {

            function generateMsg(options) {
                var message = {
                    //"subject": options.subject,
                    //"from_email": "info@limesoft.mn",
                    //"from_name": "LIME SOFT",
                    //"to": [{"email": options.to}]
                };

                if (options.mode == 'plain')
                    message.text = options.html;
                else
                    message.html = options.html;

                return message;
            }

            return {
                send: function (options) {

                    return new Promise(function (resolve, reject) {
                        setTimeout(function () {

                            //mandrill_client.messages.send({
                            //    "message": generateMsg(options)
                            //}, function (result) {
                            //
                            //    var r = result[0];
                            //
                            //    if (r.status == 'rejected')
                            //        reject('REJECTED - ' + r.reject_reason);
                            //    else if (r.status == 'invalid')
                            //        reject('INVALID SMS');
                            //    else
                            //        resolve({status: 'sent'});
                            //
                            //}, function (err) {
                            //    reject(err.name + ' - ' + err.message);
                            //});

                            resolve({status: 'sent'});
                        }, _.random(500, 2000));
                    })
                }
            }
        }
    ])
    .factory('sender', ['smsMgr', 'tplMgr', 'renderTpl', 'smsSender',
        function (smsMgr, tplMgr, renderTpl, smsSender) {

            var sms = {};

            return {
                getSms: function () {
                    return sms;
                },
                send: function () {
                    return smsMgr.find()
                        .then(function (m) {
                            if (m) {    //IF SMS FOUND
                                sms = m;
                                var smsOptions = {
                                    to: m.to,
                                    //subject: m.subject,
                                    mode: m.mode
                                };

                                if (m.template) {   //IF SMS HAS A TEMPLATE
                                    return tplMgr
                                        .find(m.template)
                                        .then(function (tpl) {
                                            if (tpl) {  //IF TEMPLATE FOUND
                                                smsOptions.html = renderTpl(tpl.content, m.params);
                                                smsOptions.mode = tpl.type;
                                            } else  //IF TEMPLATE NOT FOUND
                                                smsOptions.html = m.params;

                                            return smsSender.send(smsOptions);
                                        })
                                } else {    //IF SMS HAS NOT A TEMPLATE
                                    smsOptions.html = m.body;
                                    return smsSender.send(smsOptions);
                                }
                            } else {    //IF smsOptions NOT FOUND
                                return {
                                    status: 'finished'
                                };
                            }
                        })
                        .catch(function (err) {
                            return {
                                status: 'failed',
                                errMsg: err || 'ERROR OCCURRED WHILE SENDING SMS'
                            };
                        });
                }
            }
        }
    ])
    .factory('runner', ['models:model', 'sender',
        function (Model, sender) {

            var sms;

            function updateFailed(err) {
                return Model.Sms
                    .update(
                    {
                        status: Model.Sms.statusEnums.failed,
                        errorMessage: err
                    },
                    {where: {id: sms.id}})
                    .then(function () {
                        r.run();
                    })
            };

            var r = {
                run: function () {
                    sender.send()
                        .then(function (result) {
                            sms = sender.getSms();
                            if (result.status == 'sent') {
                                Model.Sms
                                    .update(
                                    {status: Model.Sms.statusEnums.sent},
                                    {where: {id: sms.id}})
                                    .then(function () {
                                        r.run();
                                    })
                            } else if (result.status == 'failed') {
                                updateFailed(result.errMsg);
                            } else if (result.status == 'finished') {
                                //stop
                            }
                        })
                        .catch(function (err) {
                            updateFailed(err || 'ERROR OCCURRED WHILE SENDING SMS');
                        });
                }
            };

            return r;
        }
    ]);