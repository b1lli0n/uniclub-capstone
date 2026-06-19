const express = require("express");
const { verifyToken } = require("../middlewares/auth.middleware");
const {
  getMyProfile,
  updateMyProfile,
} = require("../controllers/profile.controller");

const router = express.Router();

router.get("/me", verifyToken, getMyProfile);
router.patch("/me", verifyToken, updateMyProfile);

module.exports = router;