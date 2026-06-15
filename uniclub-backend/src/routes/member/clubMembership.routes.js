const express = require("express");
const {
  getMyClubs,
  leaveClub,
  getClubMembers
} = require("../../controllers/member/clubMembership.controller");

const router = express.Router();

router.get("/my-clubs", getMyClubs);
router.get("/:clubId/members", getClubMembers);
router.patch("/:clubId/leave", leaveClub);

module.exports = router;
