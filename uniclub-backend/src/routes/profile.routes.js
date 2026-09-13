const express = require("express");
const { verifyToken } = require("../middlewares/auth.middleware");
const {
  getMyProfile,
  getUserProfileById,
  updateMyProfile,
  searchUsers,
} = require("../controllers/profile.controller");

const router = express.Router();

router.get("/me", verifyToken, getMyProfile);
router.patch("/me", verifyToken, updateMyProfile);
router.get("/search", verifyToken, searchUsers);
router.get("/user/:userId", verifyToken, getUserProfileById);

module.exports = router;