module.exports = ['Sequelize', 'sequelize instance',
    function (Sequelize, sqInstance) {

        var StatusEnums = {pending: 10, sent: 20, cancelled: 30, failed: 40};

        var Sms = sqInstance.define('Sms', {
            id: {type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true},
            appId: {type: Sequelize.INTEGER},
            mode: {type: Sequelize.STRING, allowNull: false, defaultValue: 'plain'},
            level: {type: Sequelize.INTEGER, allowNull: false, defaultValue: 100},
            to: {type: Sequelize.STRING},
            status: {type: Sequelize.INTEGER, defaultValue: StatusEnums.pending},
            //subject: {type: Sequelize.STRING},
            body: {type: Sequelize.TEXT},
            template: {type: Sequelize.STRING},
            params: {type: Sequelize.TEXT},
            errorMessage: {type: Sequelize.STRING}
        }, {
            classMethods: {
                statusEnums: StatusEnums,
                statusLabelFromValue: function (val) {
                    for (var s in StatusEnums) {
                        if (val == StatusEnums[s])
                            return s;
                    }

                    return null;
                }

            }
        });

        return Sms;


    }
];