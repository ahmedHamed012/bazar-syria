const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../modules/user/user.schema");
const keys = require("./keys");
const catchAsync = require("../utils/catchAsync");
passport.use(
  new GoogleStrategy(
    {
      clientID: keys.googleClientID,
      clientSecret: keys.googleClientSecret,
      callbackURL: "/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      const { id, displayName, emails, photos } = profile;
      const email = emails[0].value;
      const avatar = photos[0].value;

      try {
        let user = await User.findOne({ googleId: id });
        if (!user) {
          user = await User.create({
            googleId: id,
            name: displayName,
            email,
            avatar,
          });
        }
        done(null, user);
      } catch (err) {
        done(err, null);
      }
    }
  )
);

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser((id, done) =>
  User.findById(id).then((user) => done(null, user))
);
