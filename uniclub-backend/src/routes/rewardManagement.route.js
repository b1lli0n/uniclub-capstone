const express = require("express");

const rewardManagementController = require("../controllers/rewardManagement.controller");

const { verifyToken, protect } = require("../middlewares/auth.middleware");
const { requireClubRole } = require("../middlewares/clubAuth.middleware");

const router = express.Router();

/**
 * UC-View Rewards
 */
router.get(
  "/clubs/:clubId/rewards",
  verifyToken,
  protect(["student"]),
  requireClubRole(["president"]),
  rewardManagementController.getRewards
);

/**
 * UC-View Reward Detail
 */
router.get(
  "/clubs/:clubId/rewards/:rewardId",
  verifyToken,
  protect(["student"]),
  requireClubRole(["president"]),
  rewardManagementController.getRewardDetail
);

/**
 * UC-Create Reward
 */
router.post(
  "/clubs/:clubId/rewards",
  verifyToken,
  protect(["student"]),
  requireClubRole(["president"]),
  rewardManagementController.createReward
);

/**
 * UC-Update Reward
 */
router.patch(
  "/clubs/:clubId/rewards/:rewardId",
  verifyToken,
  protect(["student"]),
  requireClubRole(["president"]),
  rewardManagementController.updateReward
);

/**
 * UC-Hide Reward
 */
router.patch(
  "/clubs/:clubId/rewards/:rewardId/hide",
  verifyToken,
  protect(["student"]),
  requireClubRole(["president"]),
  rewardManagementController.hideReward
);

/**
 * UC-View Redemption History
 */
router.get(
  "/clubs/:clubId/reward-redemptions",
  verifyToken,
  protect(["student"]),
  requireClubRole(["president"]),
  rewardManagementController.getRedemptionHistory
);

/**
 * UC-Approve Reward Redemption
 */
router.patch(
  "/clubs/:clubId/reward-redemptions/:redemptionId/approve",
  verifyToken,
  protect(["student"]),
  requireClubRole(["president"]),
  rewardManagementController.approveRewardRedemption
);

/**
 * UC-Reject Reward Redemption
 */
router.patch(
  "/clubs/:clubId/reward-redemptions/:redemptionId/reject",
  verifyToken,
  protect(["student"]),
  requireClubRole(["president"]),
  rewardManagementController.rejectRewardRedemption
);

module.exports = router;