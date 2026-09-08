const express = require("express");

const rewardManagementController = require("../controllers/rewardManagement.controller");

const { verifyToken, authorize } = require("../middlewares/auth.middleware");
const { requireClubRole } = require("../middlewares/club.middleware");

const router = express.Router();

/**
 * UC-View Rewards
 */
router.get(
  "/clubs/:clubId/rewards",
  verifyToken,
  authorize(["student"]),
  requireClubRole(["president"]),
  rewardManagementController.getRewards
);

/**
 * UC-View Reward Detail
 */
router.get(
  "/clubs/:clubId/rewards/:rewardId",
  verifyToken,
  authorize(["student"]),
  requireClubRole(["president"]),
  rewardManagementController.getRewardDetail
);

/**
 * UC-Create Reward
 */
router.post(
  "/clubs/:clubId/rewards",
  verifyToken,
  authorize(["student"]),
  requireClubRole(["president"]),
  rewardManagementController.createReward
);

/**
 * UC-Update Reward
 */
router.patch(
  "/clubs/:clubId/rewards/:rewardId",
  verifyToken,
  authorize(["student"]),
  requireClubRole(["president"]),
  rewardManagementController.updateReward
);

/**
 * UC-Hide Reward
 */
router.patch(
  "/clubs/:clubId/rewards/:rewardId/hide",
  verifyToken,
  authorize(["student"]),
  requireClubRole(["president"]),
  rewardManagementController.hideReward
);

/**
 * UC-View Redemption History
 */
router.get(
  "/clubs/:clubId/reward-redemptions",
  verifyToken,
  authorize(["student"]),
  requireClubRole(["president"]),
  rewardManagementController.getRedemptionHistory
);

/**
 * UC-Review Reward Redemption (Approve / Reject)
 */
router.patch(
  "/clubs/:clubId/reward-redemptions/:redemptionId/review",
  verifyToken,
  authorize(["student"]),
  requireClubRole(["president"]),
  rewardManagementController.reviewRewardRedemption
);

// Backward-compatibility aliases
router.patch(
  "/clubs/:clubId/reward-redemptions/:redemptionId/approve",
  verifyToken,
  authorize(["student"]),
  requireClubRole(["president"]),
  (req, res, next) => {
    req.body = req.body || {};
    req.body.status = "approved";
    return rewardManagementController.reviewRewardRedemption(req, res, next);
  }
);

router.patch(
  "/clubs/:clubId/reward-redemptions/:redemptionId/reject",
  verifyToken,
  authorize(["student"]),
  requireClubRole(["president"]),
  (req, res, next) => {
    req.body = req.body || {};
    req.body.status = "rejected";
    return rewardManagementController.reviewRewardRedemption(req, res, next);
  }
);

module.exports = router;