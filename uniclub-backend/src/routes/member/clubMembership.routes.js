const express = require("express");
const { verifyToken, protect } = require("../../middlewares/auth.middleware");
const { requireClubMember } = require("../../middlewares/clubAuth.middleware");
const {
  getMyClubs,
  leaveClub,
  getClubMembers,
} = require("../../controllers/member/clubMembership.controller");

const { getClubEventsForMember } = require("../../controllers/event.controller");

const router = express.Router();

router.get("/my-clubs", verifyToken, protect(["student"]), getMyClubs);
router.get(
  "/:clubId/members",
  verifyToken,
  protect(["student"]),
  getClubMembers
);
router.patch(
  "/:clubId/leave",
  verifyToken,
  protect(["student"]),
  requireClubMember("clubId"),
  leaveClub
);
router.get(
  "/:clubId/events",
  verifyToken,
  protect(["student"]),
  requireClubMember("clubId"),
  getClubEventsForMember
);

module.exports = router;
