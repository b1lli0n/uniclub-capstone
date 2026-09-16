const express = require("express");
const router = express.Router();

const { verifyToken, authorize } = require("../middlewares/auth.middleware");
const { requireClubRole } = require("../middlewares/club.middleware");
const clubMemberController = require("../controllers/clubMember.controller");
const { getUserProfileById } = require("../controllers/profile.controller");

const presidentGuard = [
  verifyToken,
  authorize(["student"]),
  requireClubRole(["president"], "clubId"),
];

router.get(
  "/:clubId/members/manage",
  ...presidentGuard,
  clubMemberController.getClubMembersForManagement
);

router.patch(
  "/:clubId/members/:memberId/remove",
  ...presidentGuard,
  clubMemberController.removeMember
);

// GET profile of any user by userId
router.get("/user/:userId", verifyToken, authorize(["student"]), getUserProfileById);

module.exports = router;