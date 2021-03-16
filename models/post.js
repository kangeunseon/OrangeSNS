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
      charset: "utf8",
      collate: "utf8_general_ci",
    }
  );
