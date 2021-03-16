module.exports = (sequelize, DataTypes) => {
  return sequelize.define(
    "img",
    {
      //기본키, 외래키 관계 설정할 때 시퀄라이즈가 자동생성해줌/ 여기서 할 필요 X
      url: {
        type: DataTypes.STRING(200),
        allowNull: true,
      },
      name: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      size: {
        type: DataTypes.INTEGER,
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
};
