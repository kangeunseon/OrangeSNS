"use strict";

const Sequelize = require("sequelize");
const env = process.env.NODE_ENV || "development";
const config = require(__dirname + "/../config/config")[env];
const db = {};

const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  config
);

db.sequelize = sequelize;
db.Sequelize = Sequelize;

db.User = require("./user")(sequelize, Sequelize);
db.Post = require("./post")(sequelize, Sequelize);
db.Hashtag = require("./hashtag")(sequelize, Sequelize);
db.Img = require("./img")(sequelize, Sequelize);
db.User.hasMany(db.Post);
db.Post.belongsTo(db.User);
db.Post.belongsToMany(db.Hashtag, { through: "PostHashtag" });
db.Hashtag.belongsToMany(db.Post, { through: "PostHashtag" });

db.Post.hasMany(db.Img, { foreignKey: "postId", sourceKey: "id" });
db.Img.belongsTo(db.Post, { foreignKey: "postId", targetkey: "id" });

//팔로잉, 팔로워 구현 ( 유저 테이블  N:M )
db.User.belongsToMany(db.User, {
  foreignKey: "followingId",
  as: "Followers",
  through: "Follow",
});

db.User.belongsToMany(db.User, {
  foreignKey: "followerId",
  as: "Followings",
  through: "Follow",
});

//좋아요 구현 (User, Post테이블 N:M)
db.Post.belongsToMany(db.User, {
  as: "Liker",
  through: "PostHeart",
});
db.User.belongsToMany(db.Post, {
  as: "Liked",
  through: "PostHeart",
});

module.exports = db;
