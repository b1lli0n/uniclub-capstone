const express = require("express");
const { verifyToken, protect } = require("../../middlewares/auth.middleware");
const { requireClubRole } = require("../../middlewares/clubAuth.middleware");
const {
  getPollList,
  getPollDetail,
  createPoll,
  updatePoll,
  closePoll,
} = require("../../controllers/secretary/poll.controller");

const router = express.Router({ mergeParams: true });

const secretaryAuth = [
  verifyToken,
  protect(["student"]),
  requireClubRole(["secretary"], "clubId"),
];

router.get("/", ...secretaryAuth, getPollList);
router.get("/:pollId", ...secretaryAuth, getPollDetail);
router.post("/", ...secretaryAuth, createPoll);
router.put("/:pollId", ...secretaryAuth, updatePoll);
router.patch("/:pollId/close", ...secretaryAuth, closePoll);

module.exports = router;
