const express = require("express");
const {
  getMyClubs,
  leaveClub
} = require("../../controllers/member/clubMembership.controller");

const router = express.Router();

router.get("/my-clubs", getMyClubs);
router.patch("/:clubId/leave", leaveClub);

module.exports = router;
