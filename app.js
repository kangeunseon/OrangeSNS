const express = require("express");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const path = require("path");
const session = require("express-session");
const flash = require("connect-flash"); //일회성 메세지들을 웹 브라우저에 나타냄
const passport = require("passport");
const helmet = require("helmet");
const hpp = require("hpp");
const redis = require("redis");
const RedisStore = require("connect-redis")(session);
require("dotenv").config();

//router 인스턴스를 쓸 때는 변우 이름 뒤에 Router를 붙인다.
const pageRouter = require("./routes/page");
const authRouter = require("./routes/auth");
const postRouter = require("./routes/post");
const userRouter = require("./routes/user");
const { sequelize } = require("./models"); //DB관련 js파일 폴더
const passportConfig = require("./passport"); //./passport/index.js와 같음
const logger = require("./logger");

const app = express();
sequelize.sync(); //DB-서버 연결
passportConfig(passport);

//정적파일 관련 view engine 설정
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs"); //템플릿 엔진 : ejs 사용
app.set("port", process.env.PORT || 8002); //포트번호 8002사용

//NODE_ENV 배포환경or개발환경 판단 환경 변수, .env에 x(정적파일이라)->cross-env
if (process.env.NODE_ENV === "production") {
  app.use(morgan("combined")); //배포 환경
  app.use(helmet());
  app.use(hpp());
} else {
  app.use(morgan("dev")); //개발 환경
}

app.use(express.static(path.join(__dirname, "public")));
app.use("/img", express.static(path.join(__dirname, "uploads")));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use(cookieParser(process.env.COOKIE_SECRET)); //비밀키 유출방지

const client = redis.createClient(
  process.env.REDIS_PORT,
  process.env.REDIS_HOST
);
client.auth(process.env.REDIS_PASSWORD);
const sessionOption = {
  resave: false,
  saveUninitialized: false,
  secret: process.env.COOKE_SECRET,
  cookie: {
    httpOnly: true,
    secure: false,
  },
  store: new RedisStore({
    client: client,
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
    pass: process.env.REDIS_PASSWORD,
    logErrors: true,
  }),
};
if (process.env.NODE_ENV === "production") {
  //https 환경일 때 사용
  sessionOption.proxy = true;
  sessionOption.cookie.secure = true;
}
app.use(session(sessionOption));
// app.use(
//   session({
//     resave: false,
//     saveUninitialized: false,
//     secret: process.env.COOKE_SECRET,
//     cookie: {
//       httpOnly: true,
//       secure: false,
//     },
//   })
// );

app.use(flash());
app.use(passport.initialize()); //req객체에 passport 설정
app.use(passport.session()); //req.session객체에 passport 정보 저장

logger.info("서버 시작");
app.use("/", pageRouter);
app.use("/auth", authRouter);
app.use("/post", postRouter);
app.use("/user", userRouter);

// 404 처리 미들웨어
app.use((req, res, next) => {
  const err = new Error("Not Found");
  err.status = 404;
  logger.error(err.message);
  next(err);
});

// 에러 핸들러
app.use((err, req, res, next) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};
  // render the error page
  res.status(err.status || 500);
  logger.error(err.message);
  res.render("error");
});

app.listen(app.get("port"), () => {
  console.log(app.get("port"), "번 포트에서 대기 중");
});
