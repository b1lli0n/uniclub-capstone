const express = require("express");
const { verifyToken, authorize } = require("../../middlewares/auth.middleware");
const { requireClubRole } = require("../../middlewares/club.middleware");
const {
  getPollList,
  getPollDetail,
  votePoll,
} = require("../../controllers/member/poll.controller");

const router = express.Router({ mergeParams: true });

const memberAuth = [
  verifyToken,
  authorize(["student"]),
  requireClubRole([], "clubId"),
];

router.get("/", ...memberAuth, getPollList);
router.get("/:pollId", ...memberAuth, getPollDetail);
router.post("/:pollId/vote", ...memberAuth, votePoll);

module.exports = router;
