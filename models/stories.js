module.exports = function(sequelize, DataTypes) {

    var Story = sequelize.define("Story", {
        title: DataTypes.STRING,
        blurb: DataTypes.TEXT,
        rank: DataTypes.STRING,
        cover_art: { type: DataTypes.STRING, defaultValue: "https://s3.amazonaws.com/chickenscratchdb/default_cover.jpg" }
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
