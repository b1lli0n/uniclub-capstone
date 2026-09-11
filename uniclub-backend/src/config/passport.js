const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const authService = require("../services/auth.service");
const env = require("./env");

console.log("GOOGLE_CLIENT_ID =", env.googleClientId);
console.log("GOOGLE_CALLBACK_URL =", env.googleCallbackURL);

passport.use(
  new GoogleStrategy(
    {
      clientID: env.googleClientId,
      clientSecret: env.googleClientSecret,
      callbackURL: env.googleCallbackURL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const user = await authService.findOrCreateGoogleUser(profile);
        return done(null, user);
      } catch (error) {
        if (error.statusCode === 400) {
          return done(null, false, { message: error.message });
        }
        return done(error, null);
      }
    }
  )
);

module.exports = passport;