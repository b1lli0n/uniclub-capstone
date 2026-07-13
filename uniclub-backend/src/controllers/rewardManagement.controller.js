const rewardService = require("../services/reward.service");

/**
 * UC-View Rewards
 * President xem danh sách phần thưởng của câu lạc bộ.
 */
const getRewards = async (req, res, next) => {
  try {
    const result = await rewardService.getRewards({
      clubId: req.params.clubId,
      page: req.query.page,
      limit: req.query.limit,
      search: req.query.search,
      status: req.query.status,
      sortBy: req.query.sortBy,
      sortOrder: req.query.sortOrder,
    });

    return res.status(200).json({
      success: true,
      message: "Rewards retrieved successfully",
      data: result.rewards,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * UC-View Reward Detail
 * President xem chi tiết một phần thưởng.
 */
const getRewardDetail = async (req, res, next) => {
  try {
    const reward = await rewardService.getRewardDetail({
      clubId: req.params.clubId,
      rewardId: req.params.rewardId,
    });

    return res.status(200).json({
      success: true,
      message: "Reward detail retrieved successfully",
      data: reward,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * UC-Create Reward
 * President tạo phần thưởng mới cho câu lạc bộ.
 */
const createReward = async (req, res, next) => {
  try {
    const reward = await rewardService.createReward({
      clubId: req.params.clubId,
      userId: req.user.id,
      name: req.body.name,
      description: req.body.description,
      image_url: req.body.image_url,
      point_cost: req.body.point_cost,
      quantity: req.body.quantity,
    });

    return res.status(201).json({
      success: true,
      message: "Reward created successfully",
      data: reward,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * UC-Update Reward
 * President cập nhật thông tin phần thưởng.
 */
const updateReward = async (req, res, next) => {
  try {
    const reward = await rewardService.updateReward({
      clubId: req.params.clubId,
      rewardId: req.params.rewardId,
      name: req.body.name,
      description: req.body.description,
      image_url: req.body.image_url,
      point_cost: req.body.point_cost,
      quantity: req.body.quantity,
    });

    return res.status(200).json({
      success: true,
      message: "Reward updated successfully",
      data: reward,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * UC-Hide Reward
 * President ẩn phần thưởng khỏi danh sách hiển thị cho thành viên.
 */
const hideReward = async (req, res, next) => {
  try {
    const reward = await rewardService.hideReward({
      clubId: req.params.clubId,
      rewardId: req.params.rewardId,
    });

    return res.status(200).json({
      success: true,
      message: "Reward hidden successfully",
      data: reward,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * UC-View Redemption History
 * President xem lịch sử đổi thưởng trong câu lạc bộ.
 */
const getRedemptionHistory = async (req, res, next) => {
  try {
    const result = await rewardService.getRedemptionHistory({
      clubId: req.params.clubId,
      page: req.query.page,
      limit: req.query.limit,
      status: req.query.status,
      rewardId: req.query.rewardId,
      membershipId: req.query.membershipId,
      fromDate: req.query.fromDate,
      toDate: req.query.toDate,
    });

    return res.status(200).json({
      success: true,
      message: "Redemption history retrieved successfully",
      data: result.redemptions,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * UC-Approve Reward Redemption
 * President phê duyệt yêu cầu đổi thưởng.
 */
const approveRewardRedemption = async (req, res, next) => {
  try {
    const redemption =
      await rewardService.approveRewardRedemption({
        clubId: req.params.clubId,
        redemptionId: req.params.redemptionId,
        reviewerId: req.user.id,
      });

    return res.status(200).json({
      success: true,
      message: "Reward redemption approved successfully",
      data: redemption,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * UC-Reject Reward Redemption
 * President từ chối yêu cầu đổi thưởng.
 */
const rejectRewardRedemption = async (req, res, next) => {
  try {
    const redemption =
      await rewardService.rejectRewardRedemption({
        clubId: req.params.clubId,
        redemptionId: req.params.redemptionId,
        reviewerId: req.user.id,
        rejectionReason: req.body.rejection_reason,
      });

    return res.status(200).json({
      success: true,
      message: "Reward redemption rejected successfully",
      data: redemption,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getRewards,
  getRewardDetail,
  createReward,
  updateReward,
  hideReward,
  getRedemptionHistory,
  approveRewardRedemption,
  rejectRewardRedemption,
};