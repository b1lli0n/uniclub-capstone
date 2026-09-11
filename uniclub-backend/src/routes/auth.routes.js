const express = require("express");
const passport = require("../config/passport");
const { verifyToken } = require("../middlewares/auth.middleware");
const authController = require("../controllers/auth.controller");

const router = express.Router();

router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
  })
);

router.get("/google/callback", authController.googleCallback);

router.get("/feid", authController.loginWithFeid);
router.get("/callback", authController.feidCallback);
router.get("/dev-login", authController.devLogin);

router.get("/me", verifyToken, (req, res) => {
  res.status(200).json({
    success: true,
    user: req.user,
  });
});

router.post("/logout", authController.logout);

module.exports = router;