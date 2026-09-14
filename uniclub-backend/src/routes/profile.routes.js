const express = require("express");
const { verifyToken, authorize } = require("../middlewares/auth.middleware");
const {
  getMyProfile,
  getUserProfileById,
  updateMyProfile,
  searchUsers,
} = require("../controllers/profile.controller");

const router = express.Router();

router.get("/me", verifyToken, authorize(["student"]), getMyProfile);
router.patch("/me", verifyToken, authorize(["student"]), updateMyProfile);
router.get("/search", verifyToken, authorize(["student"]), searchUsers);
router.get("/user/:userId", verifyToken, authorize(["student"]), getUserProfileById);

module.exports = router;
