
module.exports = function(sequelize, DataTypes) {
  var Art = sequelize.define("Art", {
    art_file: {
      type: DataTypes.STRING
    },
    rank: DataTypes.STRING
  },
  {
    classMethods: {
      associate: function(models) {
        Art.belongsTo(models.Contribution, {
          foreignKey: {
            allowNull: false
          }
        });
      }
    }
  }
  );
  return Art;
};
