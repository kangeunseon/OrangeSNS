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

router.get("/myPage", isLoggedIn, async (req, res, next) => {
  try {
    const posts = await Post.findAll({
      include: {
        model: User,
        where: { id: req.user.id },
        attributes: ["id", "nick"],
      },
      order: [["createdAt", "DESC"]],
    });
    //post.id와 일치하는 img 찾기
    let postIdList = new Array();
    for (let post of posts) {
      postIdList.push(post.id);
    }
    const imgs = await Img.findAll({
      where: { postId: postIdList },
      order: [["createdAt", "DESC"]],
    });
    //현재 접속한 유저 아이디 찾기
    const user = await User.findOne({
      where: { id: req.user.id },
    });
    const liked = await user.getLiked();
    liked.reverse();
    let likeList = new Array();
    for (let like of liked) {
      likeList.push(like.id);
    }
    res.render("myPage", {
      title: "내 프로필",
      user: req.user,
      posts: posts,
      imgs: imgs,
      likeList: likeList,
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
});

router.get("/likedList", isLoggedIn, async (req, res, next) => {
  try {
    const user = await User.findOne({
      where: { id: req.user.id },
    });
    const liked = await user.getLiked();
    liked.reverse();
    const likeIdList = new Array();
    for (let like of liked) {
      likeIdList.push(like.id);
    }
    const posts = await Post.findAll({
      where: { id: { [Op.in]: likeIdList } },
      include: {
        model: User,
        attributes: ["id", "nick"],
      },
      order: [["createdAt", "DESC"]],
    });
    const imgs = await Img.findAll({
      where: { postId: { [Op.in]: likeIdList } },
      order: [["postId", "DESC"]],
    });
    res.render("likedList", {
      title: "좋아요 목록",
      user: req.user,
      posts: posts,
      imgs: imgs,
      likeList: likeIdList,
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
});

router.get("/followList", isLoggedIn, async (req, res, next) => {
  res.render("followList", {
    title: "내 팔로우 목록",
    user: req.user,
  });
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
      const liked = await user.getLiked();
      liked.reverse();
      for (let like of liked) {
        likeList.push(like.id);
        console.log("좋아요 목록", like.id);
      }
      const followings = await user.getFollowings();
      for (let following of followings) {
        followList.push(following.id);
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
