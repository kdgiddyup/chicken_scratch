
module.exports = function(sequelize, DataTypes) {
  var Contribution = sequelize.define("Contribution", {
    contribution_text: DataTypes.BLOB,
    rank: DataTypes.STRING
  },
  {
    classMethods: {
      associate: function(models) {
        Contribution.belongsTo(models.Story, {
          foreignKey: {
            allowNull: false
          }
        })
        Contribution.belongsTo(models.User, {
          foreignKey: {
            allowNull: false
          }
        });
      }
  }
  });
  return Contribution;
};
