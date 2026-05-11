const passport = require("passport");
const { Strategy: GoogleStrategy } = require("passport-google-oauth20");
const User = require("../models/User");
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL || "http://localhost:5000/api/auth/google/callback",
      scope: ["profile", "email"],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value;
        const avatar = profile.photos?.[0]?.value;
        if (!email) {
          return done(new Error("No email returned from Google"), null);
        }
        let user = await User.findOne({ googleId: profile.id });
        if (user) {
          user.avatar = avatar || user.avatar;
          user.lastLoginAt = new Date();
          await user.save({ validateBeforeSave: false });
          return done(null, user);
        }
        user = await User.findOne({ email });
        if (user) {
          user.googleId = profile.id;
          user.provider = "google";
          user.avatar = user.avatar || avatar;
          user.isEmailVerified = true;
          user.lastLoginAt = new Date();
          await user.save({ validateBeforeSave: false });
          return done(null, user);
        }
        const newUser = await User.create({
          username: profile.displayName || email.split("@")[0],
          email,
          googleId: profile.id,
          avatar,
          provider: "google",
          password: null,
          isEmailVerified: true,
          lastLoginAt: new Date(),
        });
        return done(null, newUser);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);
passport.serializeUser((user, done) => done(null, user._id));
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});
module.exports = passport;