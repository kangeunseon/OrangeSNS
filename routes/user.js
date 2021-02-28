const express = require("express");

const { isLoggedIn } = require("./loginCheck");
const { User } = require("../models");

const router = express.Router();

router.post("/:id/follow", isLoggedIn, async (req, res, next) => {
  try {
    const user = await User.findOne({ where: { id: req.user.id } }); //현재 로그인 유저
    await user.addFollowing(parseInt(req.params.id, 10)); //팔로우 대상 유저
    res.send("success");
  } catch (error) {
    console.error(error);
    next(error);
  }
});

router.delete("/:id/unfollow", isLoggedIn, async (req, res, next) => {
  try {
    const user = await User.findOne({ where: { id: req.user.id } });
    await user.removeFollowing(parseInt(req.params.id, 10)); //Following 에서 지우기
    res.send("success");
  } catch (error) {
    console.error(error);
    next(error);
  }
});

router.patch("/:id", isLoggedIn, (req, res, next) => {
  const id = req.params.id;
  const nick = req.query.nick;
  User.update(
    {
      nick: nick,
    },
    {
      where: { id: id },
    }
  )
    .then(() => {
      res.send("success");
    })
    .catch((error) => {
      console.error(error);
      next(error);
    });
});

module.exports = router;
