const express = require("express");
const router = express.Router();

const { verifyToken } = require("../middlewares/auth.middleware");
const { requireClubRole } = require("../middlewares/club.middleware");
const clubMemberController = require("../controllers/clubMember.controller");

router.get(
  "/:clubId/members/manage",
  verifyToken,
  requireClubRole(["president"]),
  clubMemberController.getClubMembersForManagement
);

router.patch(
  "/:clubId/members/:memberId/remove",
  verifyToken,
  requireClubRole(["president"]),
  clubMemberController.removeMember
);

module.exports = router;