const express = require("express");
const { verifyToken, protect } = require("../../middlewares/auth.middleware");
const { requireClubMember } = require("../../middlewares/clubAuth.middleware");
const {
  getMyClubs,
  leaveClub,
  getClubMembers,
} = require("../../controllers/member/clubMembership.controller");

const router = express.Router();

router.get("/my-clubs", verifyToken, protect(["student"]), getMyClubs);
router.get(
  "/:clubId/members",
  verifyToken,
  protect(["student"]),
  requireClubMember("clubId"),
  getClubMembers
);
router.patch(
  "/:clubId/leave",
  verifyToken,
  protect(["student"]),
  requireClubMember("clubId"),
  leaveClub
);

module.exports = router;
