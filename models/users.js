
module.exports = function(sequelize, DataTypes) {
  var User = sequelize.define("User", {
      username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          is: /^[a-z0-9\_\-]+$/i
        }
      },
      password: { type: DataTypes.STRING },
      salt: {type: DataTypes.STRING }
    },
    { 
      classMethods: {
        associate: function(models) {
          User.hasMany(models.Contribution);
        }
      }
    });
  return User;
};
