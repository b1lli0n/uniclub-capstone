const express = require("express");
const { verifyToken, protect } = require("../../middlewares/auth.middleware");
const { requireClubMember } = require("../../middlewares/clubAuth.middleware");
const {
  getMyClubs,
  leaveClub,
  getClubMembers,
} = require("../../controllers/member/clubMembership.controller");

const { getClubEventsForMember } = require("../../controllers/event.controller");
const rewardController = require("../../controllers/member/reward.controller");

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

// Club member rewards
router.get(
  "/:clubId/rewards",
  verifyToken,
  protect(["student"]),
  requireClubMember("clubId"),
  rewardController.getRewards
);
router.get(
  "/:clubId/rewards/:rewardId",
  verifyToken,
  protect(["student"]),
  requireClubMember("clubId"),
  rewardController.getRewardDetail
);
router.post(
  "/:clubId/rewards/:rewardId/redeem",
  verifyToken,
  protect(["student"]),
  requireClubMember("clubId"),
  rewardController.redeemReward
);
router.get(
  "/:clubId/redemption-history",
  verifyToken,
  protect(["student"]),
  requireClubMember("clubId"),
  rewardController.getMyRedemptionHistory
);

module.exports = router;
