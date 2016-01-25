module.exports = ['Sequelize', 'sequelize instance',
    function (Sequelize, sqInstance) {
        var Template = sqInstance.define('Template', {
            id: {type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true},
            appId: {type: Sequelize.INTEGER},
            name: {type: Sequelize.STRING, allowNull: false},
            type: {type: Sequelize.STRING, defaultValue: 'plain'},
            content: {type: Sequelize.TEXT, allowNull: false}
        });

        return Template;
    }
];