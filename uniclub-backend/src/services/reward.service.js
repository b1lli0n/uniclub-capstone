const mongoose = require("mongoose");

const Reward = require("../models/reward.model");
const RewardRedemption = require("../models/reward_redemption.model");
const ContributionLog = require("../models/contribution_log.model");
const ClubMember = require("../models/club_member.model");

const { getStatusError } = require("../utils/error");

/**
 * Kiểm tra ObjectId hợp lệ.
 */
const validateObjectId = (id, fieldName) => {
  if (!id || !mongoose.isValidObjectId(id)) {
    throw getStatusError(`Invalid ${fieldName}`, 400);
  }
};

/**
 * Escape ký tự đặc biệt trước khi tìm kiếm bằng RegExp.
 */
const escapeRegex = (value = "") => {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

/**
 * Chuyển giá trị phân trang thành số hợp lệ.
 */
const normalizePagination = (page, limit) => {
  const normalizedPage = Math.max(Number.parseInt(page, 10) || 1, 1);
  const normalizedLimit = Math.min(
    Math.max(Number.parseInt(limit, 10) || 10, 1),
    100
  );

  return {
    page: normalizedPage,
    limit: normalizedLimit,
    skip: (normalizedPage - 1) * normalizedLimit,
  };
};

/**
 * UC-View Rewards
 * President xem danh sách phần thưởng thuộc câu lạc bộ.
 */
const getRewards = async ({
  clubId,
  page = 1,
  limit = 10,
  search = "",
  status,
  sortBy = "created_at",
  sortOrder = "desc",
}) => {
  validateObjectId(clubId, "club ID");

  const pagination = normalizePagination(page, limit);

  const filter = {
    club_id: clubId,
  };

  if (search.trim()) {
    filter.name = {
      $regex: escapeRegex(search.trim()),
      $options: "i",
    };
  }

  if (status) {
    const allowedStatuses = ["active", "hidden"];

    if (!allowedStatuses.includes(status)) {
      throw getStatusError("Invalid reward status", 400);
    }

    filter.status = status;
  }

  const allowedSortFields = [
    "created_at",
    "updated_at",
    "name",
    "point_cost",
    "quantity",
  ];

  const selectedSortField = allowedSortFields.includes(sortBy)
    ? sortBy
    : "created_at";

  const selectedSortOrder = sortOrder === "asc" ? 1 : -1;

  const [rewards, totalItems] = await Promise.all([
    Reward.find(filter)
      .populate("created_by", "full_name email avatar_url")
      .sort({
        [selectedSortField]: selectedSortOrder,
        _id: -1,
      })
      .skip(pagination.skip)
      .limit(pagination.limit)
      .lean(),

    Reward.countDocuments(filter),
  ]);

  return {
    rewards,
    pagination: {
      current_page: pagination.page,
      page_size: pagination.limit,
      total_items: totalItems,
      total_pages: Math.ceil(totalItems / pagination.limit),
    },
  };
};

/**
 * UC-View Reward Detail
 * President xem chi tiết một phần thưởng thuộc câu lạc bộ.
 */
const getRewardDetail = async ({ clubId, rewardId }) => {
  validateObjectId(clubId, "club ID");
  validateObjectId(rewardId, "reward ID");

  const reward = await Reward.findOne({
    _id: rewardId,
    club_id: clubId,
  })
    .populate("created_by", "full_name email avatar_url")
    .lean();

  if (!reward) {
    throw getStatusError("Reward not found", 404);
  }

  return reward;
};

/**
 * UC-Create Reward
 * President tạo phần thưởng mới cho câu lạc bộ.
 */
const createReward = async ({
  clubId,
  userId,
  name,
  description = "",
  image_url = "",
  point_cost,
  quantity,
}) => {
  validateObjectId(clubId, "club ID");
  validateObjectId(userId, "user ID");

  if (!name || !name.trim()) {
    throw getStatusError("Reward name is required", 400);
  }

  const normalizedPointCost = Number(point_cost);
  const normalizedQuantity = Number(quantity);

  if (
    !Number.isFinite(normalizedPointCost) ||
    normalizedPointCost < 1
  ) {
    throw getStatusError(
      "Point cost must be greater than or equal to 1",
      400
    );
  }

  if (
    !Number.isInteger(normalizedQuantity) ||
    normalizedQuantity < 0
  ) {
    throw getStatusError(
      "Quantity must be an integer greater than or equal to 0",
      400
    );
  }

  const reward = await Reward.create({
    club_id: clubId,
    name: name.trim(),
    description: description?.trim() || "",
    image_url: image_url?.trim() || "",
    point_cost: normalizedPointCost,
    quantity: normalizedQuantity,
    status: "active",
    created_by: userId,
  });

  return Reward.findById(reward._id)
    .populate("created_by", "full_name email avatar_url")
    .lean();
};

/**
 * UC-Update Reward
 * President cập nhật thông tin phần thưởng thuộc câu lạc bộ.
 */
const updateReward = async ({
  clubId,
  rewardId,
  name,
  description,
  image_url,
  point_cost,
  quantity,
}) => {
  validateObjectId(clubId, "club ID");
  validateObjectId(rewardId, "reward ID");

  const updateData = {};

  if (name !== undefined) {
    if (!String(name).trim()) {
      throw getStatusError("Reward name cannot be empty", 400);
    }

    updateData.name = String(name).trim();
  }

  if (description !== undefined) {
    updateData.description = String(description).trim();
  }

  if (image_url !== undefined) {
    updateData.image_url = String(image_url).trim();
  }

  if (point_cost !== undefined) {
    const normalizedPointCost = Number(point_cost);

    if (
      !Number.isFinite(normalizedPointCost) ||
      normalizedPointCost < 1
    ) {
      throw getStatusError(
        "Point cost must be greater than or equal to 1",
        400
      );
    }

    updateData.point_cost = normalizedPointCost;
  }

  if (quantity !== undefined) {
    const normalizedQuantity = Number(quantity);

    if (
      !Number.isInteger(normalizedQuantity) ||
      normalizedQuantity < 0
    ) {
      throw getStatusError(
        "Quantity must be an integer greater than or equal to 0",
        400
      );
    }

    updateData.quantity = normalizedQuantity;
  }

  if (Object.keys(updateData).length === 0) {
    throw getStatusError("No valid fields provided for update", 400);
  }

  const reward = await Reward.findOneAndUpdate(
    {
      _id: rewardId,
      club_id: clubId,
    },
    {
      $set: updateData,
    },
    {
      new: true,
      runValidators: true,
    }
  )
    .populate("created_by", "full_name email avatar_url")
    .lean();

  if (!reward) {
    throw getStatusError("Reward not found", 404);
  }

  return reward;
};

/**
 * UC-Hide Reward
 * President ẩn phần thưởng thay vì xóa khỏi hệ thống.
 */
const hideReward = async ({ clubId, rewardId }) => {
  validateObjectId(clubId, "club ID");
  validateObjectId(rewardId, "reward ID");

  const reward = await Reward.findOne({
    _id: rewardId,
    club_id: clubId,
  });

  if (!reward) {
    throw getStatusError("Reward not found", 404);
  }

  // Toggle status and is_active bi-directionally between active and hidden
  const isCurrentlyHidden = reward.status === "hidden" || reward.is_active === false;
  reward.status = isCurrentlyHidden ? "active" : "hidden";
  reward.is_active = isCurrentlyHidden;

  await reward.save();

  return reward.toObject();
};

/**
 * UC-View Redemption History
 * President xem lịch sử yêu cầu đổi thưởng của câu lạc bộ.
 */
const getRedemptionHistory = async ({
  clubId,
  page = 1,
  limit = 10,
  status,
  rewardId,
  membershipId,
  fromDate,
  toDate,
}) => {
  validateObjectId(clubId, "club ID");

  const pagination = normalizePagination(page, limit);

  const filter = {
    club_id: clubId,
  };

  if (status) {
    const allowedStatuses = ["pending", "approved", "rejected"];

    if (!allowedStatuses.includes(status)) {
      throw getStatusError("Invalid redemption status", 400);
    }

    filter.status = status;
  }

  if (rewardId) {
    validateObjectId(rewardId, "reward ID");
    filter.reward_id = rewardId;
  }

  if (membershipId) {
    validateObjectId(membershipId, "membership ID");
    filter.membership_id = membershipId;
  }

  if (fromDate || toDate) {
    filter.created_at = {};

    if (fromDate) {
      const parsedFromDate = new Date(fromDate);

      if (Number.isNaN(parsedFromDate.getTime())) {
        throw getStatusError("Invalid fromDate", 400);
      }

      filter.created_at.$gte = parsedFromDate;
    }

    if (toDate) {
      const parsedToDate = new Date(toDate);

      if (Number.isNaN(parsedToDate.getTime())) {
        throw getStatusError("Invalid toDate", 400);
      }

      parsedToDate.setHours(23, 59, 59, 999);
      filter.created_at.$lte = parsedToDate;
    }

    if (
      filter.created_at.$gte &&
      filter.created_at.$lte &&
      filter.created_at.$gte > filter.created_at.$lte
    ) {
      throw getStatusError(
        "fromDate must be earlier than or equal to toDate",
        400
      );
    }
  }

  const [redemptions, totalItems] = await Promise.all([
    RewardRedemption.find(filter)
      .populate(
        "reward_id",
        "name image_url point_cost quantity status"
      )
      .populate({
        path: "membership_id",
        select: "club_id user_id role status joined_at",
        populate: {
          path: "user_id",
          select: "full_name email avatar_url",
        },
      })
      .populate(
        "reviewed_by",
        "full_name email avatar_url"
      )
      .sort({
        created_at: -1,
        _id: -1,
      })
      .skip(pagination.skip)
      .limit(pagination.limit)
      .lean(),

    RewardRedemption.countDocuments(filter),
  ]);

  return {
    redemptions,
    pagination: {
      current_page: pagination.page,
      page_size: pagination.limit,
      total_items: totalItems,
      total_pages: Math.ceil(totalItems / pagination.limit),
    },
  };
};

/**
 * Tính tổng reward point mà thành viên đã nhận.
 */
const getTotalEarnedRewardPoint = async ({
  membershipId,
  session,
}) => {
  const result = await ContributionLog.aggregate([
    {
      $match: {
        membership_id: new mongoose.Types.ObjectId(membershipId),
      },
    },
    {
      $group: {
        _id: null,
        total: {
          $sum: "$reward_point",
        },
      },
    },
  ]).session(session);

  return result[0]?.total || 0;
};

/**
 * Tính tổng reward point đã được duyệt để đổi thưởng.
 */
const getTotalApprovedRedemptionPoint = async ({
  membershipId,
  excludeRedemptionId,
  session,
}) => {
  const match = {
    membership_id: new mongoose.Types.ObjectId(membershipId),
    status: "approved",
  };

  if (excludeRedemptionId) {
    match._id = {
      $ne: new mongoose.Types.ObjectId(excludeRedemptionId),
    };
  }

  const result = await RewardRedemption.aggregate([
    {
      $match: match,
    },
    {
      $group: {
        _id: null,
        total: {
          $sum: "$total_point",
        },
      },
    },
  ]).session(session);

  return result[0]?.total || 0;
};

/**
 * UC-Approve Reward Redemption
 * President phê duyệt yêu cầu đổi thưởng.
 *
 * Khi phê duyệt:
 * - Yêu cầu phải đang pending.
 * - Thành viên phải có đủ điểm.
 * - Reward phải còn đủ số lượng.
 * - Trừ quantity của reward.
 * - Chuyển redemption thành approved.
 */
const approveRewardRedemption = async ({
  clubId,
  redemptionId,
  reviewerId,
}) => {
  validateObjectId(clubId, "club ID");
  validateObjectId(redemptionId, "redemption ID");
  validateObjectId(reviewerId, "reviewer ID");

  const redemption = await RewardRedemption.findOne({
    _id: redemptionId,
    club_id: clubId,
  });

  if (!redemption) {
    throw getStatusError("Reward redemption not found", 404);
  }

  if (redemption.status !== "pending") {
    throw getStatusError("Only pending redemption can be approved", 400);
  }

  const reward = await Reward.findOne({
    _id: redemption.reward_id,
    club_id: clubId,
  });

  if (!reward) {
    throw getStatusError("Reward not found", 404);
  }

  const updatedReward = await Reward.findOneAndUpdate(
    {
      _id: reward._id,
      club_id: clubId,
      quantity: { $gte: redemption.quantity },
    },
    {
      $inc: { quantity: -redemption.quantity },
    },
    { new: true }
  );

  if (!updatedReward) {
    throw getStatusError("Reward quantity is insufficient", 400);
  }

  const updatedRedemption = await RewardRedemption.findOneAndUpdate(
    {
      _id: redemptionId,
      club_id: clubId,
      status: "pending",
    },
    {
      $set: {
        status: "approved",
        rejection_reason: "",
        reviewed_by: reviewerId,
        reviewed_at: new Date(),
      },
    },
    {
      new: true,
      runValidators: true,
    }
  );

  if (!updatedRedemption) {
    throw getStatusError("Redemption has already been processed", 409);
  }

  // Decrement points in ClubMember document cache
  await ClubMember.findOneAndUpdate(
    { _id: redemption.membership_id },
    { $inc: { reward_point: -redemption.total_point } }
  );

  const resultDoc = await RewardRedemption.findById(updatedRedemption._id)
    .populate("reward_id", "name image_url point_cost quantity status")
    .populate({
      path: "membership_id",
      select: "club_id user_id role status joined_at",
      populate: [
        { path: "user_id", select: "full_name email avatar_url" },
        { path: "club_id", select: "name" },
      ],
    })
    .populate("reviewed_by", "full_name email avatar_url")
    .lean();

  try {
    const { sendRedemptionApprovedEmailToStudent } = require("./email.service");
    const studentEmail = resultDoc?.membership_id?.user_id?.email;
    if (studentEmail) {
      const pickupCode = `REDEEM-${resultDoc._id.toString().substring(18).toUpperCase()}`;
      sendRedemptionApprovedEmailToStudent({
        toEmail: studentEmail,
        userName: resultDoc?.membership_id?.user_id?.full_name || "Sinh viên",
        clubName: resultDoc?.membership_id?.club_id?.name || "Guitar Club",
        rewardTitle: resultDoc?.reward_id?.name || "Phần thưởng",
        pointCost: resultDoc?.total_point || resultDoc?.point_cost,
        pickupCode,
      });
    }
  } catch (emailErr) {
    console.error("[Approve Redeem Email Error]", emailErr);
  }

  return resultDoc;
};

/**
 * UC-Reject Reward Redemption
 * President từ chối yêu cầu đổi thưởng và lưu lý do.
 *
 * Khi từ chối:
 * - Yêu cầu phải đang pending.
 * - Lý do từ chối là bắt buộc.
 * - Không trừ điểm.
 * - Không trừ quantity của reward.
 */
const rejectRewardRedemption = async ({
  clubId,
  redemptionId,
  reviewerId,
  rejectionReason,
}) => {
  validateObjectId(clubId, "club ID");
  validateObjectId(redemptionId, "redemption ID");
  validateObjectId(reviewerId, "reviewer ID");

  if (!rejectionReason || !rejectionReason.trim()) {
    throw getStatusError(
      "Rejection reason is required",
      400
    );
  }

  const redemption = await RewardRedemption.findOneAndUpdate(
    {
      _id: redemptionId,
      club_id: clubId,
      status: "pending",
    },
    {
      $set: {
        status: "rejected",
        rejection_reason: rejectionReason.trim(),
        reviewed_by: reviewerId,
        reviewed_at: new Date(),
      },
    },
    {
      new: true,
      runValidators: true,
    }
  )
    .populate("reward_id", "name image_url point_cost quantity status")
    .populate({
      path: "membership_id",
      select: "club_id user_id role status joined_at",
      populate: [
        { path: "user_id", select: "full_name email avatar_url" },
        { path: "club_id", select: "name" },
      ],
    })
    .populate("reviewed_by", "full_name email avatar_url")
    .lean();

  if (!redemption) {

    throw getStatusError(
      "Only pending redemption can be rejected",
      400
    );
  }

  return redemption;
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