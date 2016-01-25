/**
 * @apiDefine AppId
 * @apiParam (url) {String} app application id
 */

module.exports = ['sms-base router', '$web:routerFactory', 'models:model', '$lodash', '$web:body-parser', 'ss:runner',
    function (base, factory, Model, _, bodyParser, runner) {


        var router = factory('/service/:appId', {
            base: base,
            options: {mergeParams: true}
        });


        /**
         * @api {post} /service/:appId/send send sms
         * @apiName serviceSend
         * @apiGroup service
         * @apiDescription
         * Илгээх 2 төрөлтэй. Үүнд:<br>
         *     1. `plain`  -  `body` талбарыг шууд илгээнэ<br>
         *     2. `template` - харгалзах `template`-н дагуу хэвшүүлэн илгээнэ.
         *        `mode` нь `template` дээр урьдчилан тохируулагдсан байна <br>
         *
         * `params` талбар утгатай байвал `template` төрлөөр ажиллана. ямар нэг 'template' буюу загвар олдохгүй тохиолдолд `params`
         * талбарын утгыг 'json string' хэлбэрээр илгээнэ.
         *
         * @apiUse AppId
         * @apiParam (body){Number} level=100 sending order. order type asc
         * @apiParam (body){String=html,plain} mode=plain  sms-г илгээх mode
         * @apiParam (body){String} to to number
         * @apiParam (body){String} body sms content
         * @apiParam (body){String} template="first template" template name
         * @apiParam (body){json} [params] template params буюу template-д хэвшүүлэх хувьсагчууд
         *
         * @apiSuccess {String} transaction transaction id
         *
         * @apiError NotPayment
         * @apiUse ErrorResp
         */
        router.post('/send', bodyParser.json(), function (req, res) {
            res.promiseJson(function () {
                return Model.Mail
                    .create(_.merge(req.body, {
                        appId: req.params.appId,
                        params: JSON.stringify(req.body.params || {})
                    }))
                    .then(function (sms) {
                        runner.run();
                        return {transaction: sms.id};
                    });
            });

        });

        /**
         * @api {get} /service/:app/check/:transaction check sms status
         * @apiName serviceCheck
         * @apiGroup service
         *
         * @apiParam (url){String} transaction transaction id
         *
         * @apiSuccess {String} status sms status
         */
        router.get('/check/:transaction', function (req, res) {
            res.promiseJson(function () {
                return Model.Sms
                    .findById(req.params.transaction)
                    .then(function (sms) {
                        if (!sms) throw new Error('NOT FOUND SMS.');
                        else {
                            return {
                                status: Model.Sms.statusLabelFromValue(sms.status),
                                code: sms.status
                            };
                        }
                    });
            });
        });

        /**
         * @api {get} /service/:app/stop/:transaction cancel sms
         * @apiName serviceStop
         * @apiGroup service
         *
         * @apiParam (url){String} transaction transaction id
         * @apiUse TrueFalseResult
         */
        router.get('/stop/:transaction', function (req, res) {

            res.promiseJson(function () {
                return Model.Sms
                    .findById(req.params.transaction)
                    .then(function (sms) {
                        if (!sms) throw new Error('NOT FOUND SMS.');
                        else {
                            var enums = Model.Sms.statusEnums;
                            if (sms.status == enums.pending) {
                                return sms
                                    .update({status: enums.cancelled})
                                    .then(function () {
                                        return {result: true};
                                    });
                            } else
                                return {result: false};
                        }
                    });
            });

        });
    }
];