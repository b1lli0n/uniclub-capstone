const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../models/user.model");
const env = require("../config/env");

passport.use(
  new GoogleStrategy(
    {
      clientID: env.googleClientId,
      clientSecret: env.googleClientSecret,
      callbackURL: env.googleCallbackURL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value;

        if (!email) {
          return done(null, false, { message: "No email found" });
        }

        if (!email.endsWith("@fpt.edu.vn")) {
          return done(null, false, {
            message: "Only FPT email is allowed",
          });
        }

        let user = await User.findOne({ email });

        if (!user) {
          user = await User.create({
            provider: "google",
            provider_id: profile.id,
            full_name: profile.displayName,
            email: email,
            avatar_url: profile.photos?.[0]?.value,
            role: "student",
            });
        }

        if (user.status !== "active") {
          return done(null, false, {
            message: "Account is inactive",
          });
        }

        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

module.exports = passport;