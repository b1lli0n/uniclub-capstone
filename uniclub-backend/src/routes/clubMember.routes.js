const express = require("express");
const router = express.Router();

const { verifyToken, authorize } = require("../middlewares/auth.middleware");
const { requireClubRole } = require("../middlewares/club.middleware");
const clubMemberController = require("../controllers/clubMember.controller");

const presidentGuard = [
  verifyToken,
  authorize(["student"]),
  requireClubRole(["president", "leader"], "clubId"),
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

module.exports = router;