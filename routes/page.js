const express = require("express");
const { isLoggedIn, isNotLoggedIn } = require("./loginCheck");
const {
  Post,
  User,
  Img,
  Sequelize: { Op },
} = require("../models");

const router = express.Router();

router.get("/login", isNotLoggedIn, (req, res, next) => {
  try {
    res.render("login", {
      title: "로그인",
      user: req.user,
    });
  } catch (error) {
    console.error(error);
    next();
  }
});

router.get("/join", isNotLoggedIn, (req, res, next) => {
  res.render("join", {
    title: "회원가입 - NodeBrid",
    user: req.user,
    joinError: req.flash("joinError"),
  });
});

router.get("/", async (req, res, next) => {
  try {
    // 첫 화면에 게시글 5개만 보이기
    const posts = await Post.findAll({
      include: [
        {
          model: User,
          attributes: ["id", "nick"],
        },
      ],
      order: [["createdAt", "DESC"]],
      limit: 5,
    });

    let likeList = new Array();
    if (req.user) {
      //현재 접속한 유저 아이디 찾기
      const user = await User.findOne({
        where: { id: req.user.id },
      });

      //좋아요 목록과 회원이 좋아요 누른 postId 비교해서 배열에 저장
      const liked = await user.getLiked();
      liked.reverse();
      for (let like of liked) {
        likeList.push(like.id);
      }
    }

    //post.id와 일치하는 img 찾기
    let postIdList = new Array();
    for (let post of posts) {
      postIdList.push(post.id);
    }
    const imgs = await Img.findAll({
      where: { postId: postIdList },
      order: [["createdAt", "DESC"]],
    });
    res.render("main", {
      title: "OrangeSNS",
      user: req.user,
      posts: posts,
      imgs: imgs,
      likeList: likeList,
    });
  } catch (error) {
    console.error(error);
    next();
  }
});

router.get("/more", async (req, res, next) => {
  try {
    const postId = parseInt(req.query.postId, 10); //last post-id
    const posts = await Post.findAll({
      where: { id: { [Op.lt]: postId } }, //Op.lt - postId 미만
      include: [
        {
          model: User,
          attributes: ["id", "nick"],
        },
      ],
      limit: 5,
      order: [["createdAt", "DESC"]],
    });
    let likeList = new Array();
    let followList = new Array();
    if (req.user) {
      //현재 접속한 유저 아이디 찾기
      const user = await User.findOne({
        where: { id: req.user.id },
      });
      const followings = await user.getFollowings();
      for (let following of followings) {
        followList.push(following.id);
      }
      const liked = await user.getLiked();
      liked.reverse();
      for (let like of liked) {
        likeList.push(like.id);
        console.log("좋아요 목록", like.id);
      }
    }
    let postIdList = new Array();
    for (let post of posts) {
      postIdList.push(post.id);
    }
    const imgs = await Img.findAll({
      where: { postId: postIdList },
      order: [["createdAt", "DESC"]],
    });
    res.json({
      posts: posts,
      imgs: imgs,
      likeList: likeList,
      followings: followList,
    });
  } catch (error) {
    console.error(error);
    next();
  }
});

module.exports = router;
