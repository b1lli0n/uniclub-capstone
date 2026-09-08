const express = require("express");
const { verifyToken, authorize } = require("../../middlewares/auth.middleware");
const { requireClubMember } = require("../../middlewares/club.middleware");
const {
  getMyClubs,
  leaveClub,
  getClubMembers,
} = require("../../controllers/member/clubMembership.controller");

const { getClubEventsForMember } = require("../../controllers/event.controller");
const rewardController = require("../../controllers/member/reward.controller");

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
  requireClubMember("clubId"),
  leaveClub
);
router.get(
  "/:clubId/events",
  verifyToken,
  authorize(["student"]),
  requireClubMember("clubId"),
  getClubEventsForMember
);

// Club member rewards
router.get(
  "/:clubId/rewards",
  verifyToken,
  authorize(["student"]),
  requireClubMember("clubId"),
  rewardController.getRewards
);
router.get(
  "/:clubId/rewards/:rewardId",
  verifyToken,
  authorize(["student"]),
  requireClubMember("clubId"),
  rewardController.getRewardDetail
);
router.post(
  "/:clubId/rewards/:rewardId/redeem",
  verifyToken,
  authorize(["student"]),
  requireClubMember("clubId"),
  rewardController.redeemReward
);
router.get(
  "/:clubId/redemption-history",
  verifyToken,
  authorize(["student"]),
  requireClubMember("clubId"),
  rewardController.getMyRedemptionHistory
);

module.exports = router;
