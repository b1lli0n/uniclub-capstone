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
  passport.authenticate("google", {
    session: false,
    failureRedirect: `${env.frontendURL}/login`,
  }),
  (req, res) => {
    const token = createToken({
      id: req.user._id,
      email: req.user.email,
      role: req.user.role,
    });

    res.redirect(`${env.frontendURL}/auth/callback?token=${token}`);
  }
);

router.get("/feid", authController.loginWithFeid);
router.get("/callback", authController.feidCallback);

router.get("/me", verifyToken, (req, res) => {
  res.status(200).json({
    success: true,
    user: req.user,
  });
});

router.post('/logout', authController.logout)

module.exports = router;