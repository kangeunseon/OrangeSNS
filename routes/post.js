const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const { Post, Hashtag, User, Img } = require("../models");
const { isLoggedIn } = require("./loginCheck");

const router = express.Router();

fs.readdir("uploads", (error) => {
  //uploads폴더 있는지 확인
  if (error) {
    console.error("uploads폴더가 없어 uploads폴더를 생성합니다.");
    fs.mkdirSync("uploads");
  }
});

const upload = multer({
  storage: multer.diskStorage({
    destination(req, file, cb) {
      cb(null, "uploads/");
    },
    filename(req, file, cb) {
      const ext = path.extname(file.originalname);
      cb(null, path.basename(file.originalname, ext) + Date.now() + ext);
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
});

// 사진 upload에 저장하고 전달해서 미리보기
router.post("/img", isLoggedIn, upload.array("img", 4), (req, res) => {
  console.log("파일 이름 : ", req.files);
  let urlArr = new Array();
  for (let i = 0; i < req.files.length; i++) {
    urlArr.push({
      url: `/img/${req.files[i].filename}`,
      name: req.files[i].filename,
      size: req.files[i].size,
    });
    console.log(urlArr[i]);
  }
  let jsonUrl = JSON.stringify(urlArr);
  res.json(jsonUrl);
});

//미리보기 사진 삭제
router.delete("/img", isLoggedIn, (req, res) => {
  const img_path = "./uploads/" + req.query.img_name;
  console.log(img_path);
  fs.unlink(img_path, () => {
    res.send("success");
  });
});

const upload2 = multer();

router.post(
  "/",
  isLoggedIn,
  upload2.array("img", 4),
  async (req, res, next) => {
    //body-parser대신 multer.none()으로 req.body요청
    try {
      const post = await Post.create({
        content: req.body.content,
        userId: req.user.id,
      });
      const hashtags = req.body.content.match(/#[^\s#]*/g);
      if (hashtags) {
        const result = await Promise.all(
          hashtags.map((tag) =>
            Hashtag.findOrCreate({
              where: { title: tag.slice(1).toLowerCase() },
            })
          )
        );
        await post.addHashtags(result.map((r) => r[0]));
      }
      if (req.body.count > 0) {
        console.log("사진있음");
        const postId = await Post.findOne({
          attributes: ["id"],
          order: [["id", "DESC"]],
          limit: 1,
        });
        if (req.body.count == 1) {
          //이미지 한 개
          for (let i = 0; i < req.body.count; i++) {
            await Img.create({
              url: req.body.img_url,
              name: req.body.img_name,
              size: req.body.img_size,
              postId: postId.id,
            });
          }
        } else {
          // 이미지 여러개
          for (let i = 0; i < req.body.count; i++) {
            await Img.create({
              url: req.body.img_url[i],
              name: req.body.img_name[i],
              size: req.body.img_size[i],
              postId: postId.id,
            });
          }
        }
      }
      //글쓰고 main/profile 로 새로고침
      if (req.body.refresh == 0) {
        //0은 main
        res.redirect("/");
      } else if (req.body.refresh == 1) {
        res.redirect(`/profile/${req.user.id}`); //1은 profile
      }
    } catch (error) {
      console.error(error);
      next();
    }
  }
);

//게시글 좋아요 추가
router.post("/heart/:id", isLoggedIn, async (req, res, next) => {
  try {
    console.log(req.params.id);
    const post = await Post.findOne({ where: { id: req.params.id } });
    await post.addLiker(req.user.id);
    res.send("success");
  } catch (error) {
    console.error(error);
    next(error);
  }
});

//게시글 좋아요 삭제
router.delete("/heart/:id", isLoggedIn, async (req, res, next) => {
  try {
    const post = await Post.findOne({ where: { id: req.params.id } });
    await post.removeLiker(req.user.id);
    res.send("success");
  } catch (error) {
    console.error(error);
    next(error);
  }
});

//Edit POST
router.patch("/:id", isLoggedIn, async (req, res, next) => {
  try {
    const post = await Post.findOne({ where: { id: req.params.id } });
    post.update({ content: req.body.content });
    if (req.body.del_imgList.length > 0) {
      for (let i = 0; i < req.body.del_imgList.length; i++) {
        await Img.destroy({
          where: { id: req.body.del_imgList[i] },
        });
      }
    }
    if (req.body.add_imgList.length > 0) {
      for (let i = 0; i < req.body.add_imgList.length; i++) {
        await Img.create({
          url: req.body.add_imgList[i].url,
          name: req.body.add_imgList[i].name,
          size: req.body.add_imgList[i].size,
          postId: req.params.id,
        });
      }
    }
    res.send("success");
  } catch (error) {
    console.error(error);
    next(error);
  }
});

//Delete POST
router.delete("/:id", isLoggedIn, async (req, res, next) => {
  try {
    //POST 좋아요,사진들도 같이 삭제
    const post = await Post.findOne({ where: { id: req.params.id } });
    const likers = await post.getLiker();
    console.log(likers);
    for (let liker of likers) {
      await post.removeLiker(liker.id);
    }
    await Img.destroy({ where: { postId: req.params.id } });
    await post.destroy();
    res.send("success");
  } catch (error) {
    console.error(error);
    next(error);
  }
});

module.exports = router;
