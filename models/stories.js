module.exports = function(sequelize, DataTypes) {
  var Story = sequelize.define("Story", {
    title: DataTypes.STRING,
    blurb: DataTypes.STRING,
    rank: DataTypes.STRING,
    classMethods: {
      associate: function(models) {
        Story.hasMany(models.Contribution, {
          foreignKey: {
            allowNull: false
          }
        });
      }
    },
    classMethods: {
      associate: function(models) {
        Story.hasMany(models.Art, {
          foreignKey: {
            allowNull: false
          }
        });
      }
    }
  });
  return Story;
};
