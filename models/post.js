module.exports = (sequelize, DataTypes) =>
  sequelize.define(
    "post",
    {
      content: {
        type: DataTypes.STRING(40),
        allowNull: true,
      },
    },
    {
      timestamps: true,
      paranoid: true,
    }
  );
