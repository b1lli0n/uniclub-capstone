const express = require("express");
const { verifyToken, protect } = require("../../middlewares/auth.middleware");
const { requireClubMember } = require("../../middlewares/clubAuth.middleware");
const {
  getPollList,
  getPollDetail,
  votePoll,
} = require("../../controllers/member/poll.controller");

const router = express.Router({ mergeParams: true });

const memberAuth = [
  verifyToken,
  protect(["student"]),
  requireClubMember("clubId"),
];

router.get("/", ...memberAuth, getPollList);
router.get("/:pollId", ...memberAuth, getPollDetail);
router.post("/:pollId/vote", ...memberAuth, votePoll);

module.exports = router;
