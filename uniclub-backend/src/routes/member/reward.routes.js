const express = require("express");
const { verifyToken, authorize } = require("../../middlewares/auth.middleware");
const { requireClubMember } = require("../../middlewares/club.middleware");
const {
  getRewards,
  getRewardDetail,
  redeemReward,
  getMyRedemptionHistory,
} = require("../../controllers/member/reward.controller");

const router = express.Router();

// Middleware guard: User must be authenticated, be a student, and be an active member of the club
const memberGuard = [
  verifyToken,
  authorize(["student"]),
  requireClubMember("clubId"),
];

// Club member rewards
router.get("/:clubId/rewards", ...memberGuard, getRewards);
router.get("/:clubId/rewards/:rewardId", ...memberGuard, getRewardDetail);
router.post("/:clubId/rewards/:rewardId/redeem", ...memberGuard, redeemReward);
router.get("/:clubId/redemption-history", ...memberGuard, getMyRedemptionHistory);

module.exports = router;
