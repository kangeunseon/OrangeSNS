const KaKaoStrategy = require("passport-kakao").Strategy; //모듈에서 Strategy 생성자 불러오기

const { User } = require("../models");

module.exports = (passport) => {
  passport.use(
    new KaKaoStrategy(
      {
        clientID: process.env.KAKAO_ID,
        callbackURL: "/auth/kakao/callback",
      },
      async (accessToken, refreshToken, profile, done) => {
        console.log(
          `accessToken : ${accessToken}\n refreshToken : ${refreshToken}\n name : ${profile.displayName}`
        ); //확인용
        try {
          const exUser = await User.findOne({
            where: { snsId: profile.id, provider: "kakao" },
          });
          if (exUser) {
            done(null, exUser);
          } else {
            const newUser = await User.create({
              email: profile._json && profile._json.kaccout_email,
              nick: profile.displayName,
              snsId: profile.id,
              provider: "kakao",
            });
            done(null, newUser); //기존에 로그인한 사용자 있을 시 done호출
          }
        } catch (error) {
          console.error(error);
          done(error);
        }
      }
    )
  );
};
