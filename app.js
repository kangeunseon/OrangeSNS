const express = require("express");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const path = require("path");
const session = require("express-session");
const flash = require("connect-flash"); //일회성 메세지들을 웹 브라우저에 나타냄
const passport = require("passport");
require("dotenv").config();

//router 인스턴스를 쓸 때는 변우 이름 뒤에 Router를 붙인다.
const pageRouter = require("./routes/page");
const authRouter = require("./routes/auth");
const postRouter = require("./routes/post");
const userRouter = require("./routes/user");
const { sequelize } = require("./models"); //DB관련 js파일 폴더
const passportConfig = require("./passport"); //./passport/index.js와 같음

const app = express();
sequelize.sync(); //DB-서버 연결
passportConfig(passport);

//정적파일 관련 view engine 설정
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs"); //템플릿 엔진 : ejs 사용
app.set("port", process.env.PORT || 8002); //포트번호 8002사용

app.use(morgan("dev"));
app.use(express.static(path.join(__dirname, "public")));
app.use("/img", express.static(path.join(__dirname, "uploads")));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use(cookieParser(process.env.COOKIE_SECRET)); //비밀키 유출방지

app.use(
  session({
    resave: false,
    saveUninitialized: false,
    secret: process.env.COOKE_SECRET,
    cookie: {
      httpOnly: true,
      secure: false,
    },
  })
);

app.use(flash());
app.use(passport.initialize()); //req객체에 passport 설정
app.use(passport.session()); //req.session객체에 passport 정보 저장

app.use("/", pageRouter);
app.use("/auth", authRouter);
app.use("/post", postRouter);
app.use("/user", userRouter);

// 404 처리 미들웨어
app.use((req, res, next) => {
  const err = new Error("Not Found");
  err.status = 404;
  next(err);
});

// 에러 핸들러
app.use((err, req, res, next) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};
  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

app.listen(app.get("port"), () => {
  console.log(app.get("port"), "번 포트에서 대기 중");
});
