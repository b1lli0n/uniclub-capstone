const express = require("express");
const passport = require("../config/passport");
const { createToken, verifyToken } = require("../middlewares/auth.middleware");
const authController = require("../controllers/auth.controller");
const env = require("../config/env");

const router = express.Router();

router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
  })
);

router.get(
  "/google/callback",
  (req, res, next) => {
    passport.authenticate("google", { session: false }, (err, user, info) => {
      if (err) {
        return res.redirect(`${env.frontendURL}/login?error=${encodeURIComponent(err.message || "Authentication failed")}`);
      }
      if (!user) {
        const msg = info?.message || "Only FPT email is allowed";
        return res.redirect(`${env.frontendURL}/login?error=${encodeURIComponent(msg)}`);
      }
      
      const token = createToken({
        id: user._id,
        email: user.email,
        role: user.role,
      });

      return res.redirect(`${env.frontendURL}/auth/callback?token=${token}`);
    })(req, res, next);
  }
);

router.get("/feid", authController.loginWithFeid);
router.get("/callback", authController.feidCallback);
router.get("/dev-login", authController.devLogin);

router.get("/me", verifyToken, (req, res) => {
  res.status(200).json({
    success: true,
    user: req.user,
  });
});

router.post('/logout', authController.logout)

module.exports = router;