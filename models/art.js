
module.exports = function(sequelize, DataTypes) {
  var Art = sequelize.define("Art", {
    art_file: DataTypes.STRING,
    rank: DataTypes.STRING,
    isCover: DataTypes.BOOLEAN
    // classMethods: {
    //   associate: function(models) {
    //     Art.belongsTo(models.Story, {
    //       foreignKey: {
    //         allowNull: false
    //       }
    //     });
    //   }
    // }
  });
  return Art;
};
