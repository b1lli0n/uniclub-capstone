const express = require("express");
const { verifyToken, authorize } = require("../../middlewares/auth.middleware");
const { requireClubRole } = require("../../middlewares/club.middleware");
const {
  getMyClubs,
  leaveClub,
  getClubMembers,
} = require("../../controllers/member/clubMembership.controller");

const { getClubEventsForMember } = require("../../controllers/event.controller");

const router = express.Router();

router.get("/my-clubs", verifyToken, authorize(["student"]), getMyClubs);
router.get(
  "/:clubId/members",
  verifyToken,
  authorize(["student"]),
  getClubMembers
);
router.patch(
  "/:clubId/leave",
  verifyToken,
  authorize(["student"]),
  requireClubRole([], "clubId"),
  leaveClub
);
router.get(
  "/:clubId/events",
  verifyToken,
  authorize(["student"]),
  requireClubRole([], "clubId"),
  getClubEventsForMember
);

module.exports = router;

