module.exports = function(sequelize, DataTypes) {

    var Story = sequelize.define("Story", {
        title: DataTypes.STRING,
        blurb: DataTypes.STRING,
        rank: DataTypes.STRING,
        cover_art: { type: DataTypes.STRING, defaultValue: './assets/media/3.jpg' }
    }, {
        classMethods: {
            associate: function(models) {
                Story.hasMany(models.Contribution);
                Story.hasMany(models.Art);
            }
        }
    });
    return Story;
};
