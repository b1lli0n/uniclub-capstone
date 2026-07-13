const rewardService = require("../../services/member/reward.service");

const getRewards = async (req, res, next) => {
  try {
    const data = await rewardService.getMemberRewards({
      clubId: req.params.clubId,
      userId: req.user.id,
      search: req.query.search,
    });

    return res.status(200).json({
      success: true,
      message: "Rewards retrieved successfully",
      data,
    });
  } catch (error) {
    next(error);
  }
};

const getRewardDetail = async (req, res, next) => {
  try {
    const data = await rewardService.getMemberRewardDetail({
      clubId: req.params.clubId,
      rewardId: req.params.rewardId,
      userId: req.user.id,
    });

    return res.status(200).json({
      success: true,
      message: "Reward detail retrieved successfully",
      data,
    });
  } catch (error) {
    next(error);
  }
};

const redeemReward = async (req, res, next) => {
  try {
    const data = await rewardService.redeemReward({
      clubId: req.params.clubId,
      rewardId: req.params.rewardId,
      userId: req.user.id,
    });

    return res.status(201).json({
      success: true,
      message: "Reward redemption request created successfully",
      data,
    });
  } catch (error) {
    next(error);
  }
};

const getMyRedemptionHistory = async (req, res, next) => {
  try {
    const data = await rewardService.getMyRedemptionHistory({
      clubId: req.params.clubId,
      userId: req.user.id,
      status: req.query.status,
    });

    return res.status(200).json({
      success: true,
      message: "Redemption history retrieved successfully",
      data,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getRewards,
  getRewardDetail,
  redeemReward,
  getMyRedemptionHistory,
};
