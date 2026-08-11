const mongoose = require("mongoose");
const Club = require("../../models/club.model");
const ClubMember = require("../../models/club_member.model");
const Reward = require("../../models/reward.model");
const RewardRedemption = require("../../models/reward_redemption.model");
const ContributionLog = require("../../models/contribution_log.model");
const { getStatusError } = require("../../utils/error");

const validateId = (id, fieldName) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw getStatusError(`Invalid ${fieldName}`, 400);
  }
};

const getActiveMembership = async (clubId, userId) => {
  const membership = await ClubMember.findOne({
    club_id: clubId,
    user_id: userId,
    status: "active",
  });

  if (!membership) {
    throw getStatusError("You are not an active member of this club", 403);
  }

  return membership;
};

const getMemberRewards = async ({ clubId, userId, search }) => {
  validateId(clubId, "clubId");
  const membership = await getActiveMembership(clubId, userId);

  const filter = {
    club_id: clubId,
    $or: [{ is_active: true }, { status: "active" }],
  };

  if (search?.trim()) {
    const keyword = search.trim();
    filter.name = { $regex: keyword, $options: "i" };
  }

  const rewards = await Reward.find(filter)
    .sort({ created_at: -1 })
    .select("_id name description points_required point_cost image_url quantity is_active status created_at");

  return {
    available_points: membership.reward_point,
    rewards,
  };
};

const getMemberRewardDetail = async ({ clubId, rewardId, userId }) => {
  validateId(clubId, "clubId");
  validateId(rewardId, "rewardId");

  const [membership, reward] = await Promise.all([
    getActiveMembership(clubId, userId),
    Reward.findOne({ _id: rewardId, club_id: clubId, is_active: true })
      .populate("club_id", "_id name logo_url")
      .select("_id club_id name description points_required point_cost image_url quantity is_active status created_at updated_at"),
  ]);

  if (!reward) {
    throw getStatusError("Reward not found", 404);
  }

  return {
    available_points: membership.reward_point,
    can_redeem: reward.quantity > 0 && membership.reward_point >= reward.points_required,
    reward,
  };
};

const getTotalEarnedRewardPoint = async ({ membershipId, session }) => {
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

const getTotalApprovedRedemptionPoint = async ({ membershipId, session }) => {
  const result = await RewardRedemption.aggregate([
    {
      $match: {
        membership_id: new mongoose.Types.ObjectId(membershipId),
        status: "approved",
      },
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

const redeemReward = async ({ clubId, rewardId, userId }) => {
  validateId(clubId, "clubId");
  validateId(rewardId, "rewardId");

  const club = await Club.findOne({ _id: clubId, status: "active" });
  if (!club) {
    throw getStatusError("Club not found or inactive", 404);
  }

  const reward = await Reward.findOne({
    _id: rewardId,
    club_id: clubId,
    $or: [{ is_active: true }, { status: "active" }],
  });

  if (!reward) {
    throw getStatusError("Reward not found or unavailable", 404);
  }

  if (reward.quantity < 1) {
    throw getStatusError("Reward is out of stock", 409);
  }

  const membership = await ClubMember.findOne({
    club_id: clubId,
    user_id: userId,
    status: "active",
  });

  if (!membership) {
    throw getStatusError("You are not an active member of this club", 403);
  }

  // Calculate dynamic available points based on membership.reward_point and pending redemptions
  const pendingRedemptions = await RewardRedemption.find({
    membership_id: membership._id,
    status: "pending",
  });
  
  const pendingPoints = pendingRedemptions.reduce((sum, r) => sum + (r.total_point || 0), 0);
  const memberPoints = membership.reward_point || 0;
  const availablePoints = Math.max(memberPoints - pendingPoints, 0);

  const cost = reward.point_cost ?? reward.points_required ?? 100;
  if (availablePoints < cost) {
    throw getStatusError("Insufficient reward points", 400);
  }

  // Create pending RewardRedemption request
  const redemption = await RewardRedemption.create({
    club_id: clubId,
    reward_id: reward._id,
    membership_id: membership._id,
    quantity: 1,
    point_cost: cost,
    total_point: cost,
    status: "pending",
  });

  await redemption.populate("reward_id", "_id name description points_required point_cost quantity image_url");

  // Trigger Email notification to Leader
  try {
    const { sendRedemptionRequestEmailToLeader } = require("../email.service");
    const User = require("../../models/user.model");
    const userDoc = await User.findById(userId);

    sendRedemptionRequestEmailToLeader({
      leaderEmail: process.env.EMAIL_USER || "uniclub2402@gmail.com",
      userName: userDoc?.full_name || "Sinh viên UniClub",
      clubName: club?.name || "Guitar Club",
      rewardTitle: reward?.name || "Phần thưởng",
      pointCost: cost,
    });
  } catch (emailErr) {
    console.error("[Redeem Hook] Email trigger error:", emailErr);
  }

  return redemption;
};

const getMyRedemptionHistory = async ({ clubId, userId, status }) => {
  validateId(clubId, "clubId");
  const membership = await getActiveMembership(clubId, userId);

  const allowedStatuses = ["pending", "approved", "rejected"];
  if (status && !allowedStatuses.includes(status)) {
    throw getStatusError("Invalid status. Allowed values: pending, approved, rejected", 400);
  }

  const filter = { club_id: clubId, membership_id: membership._id };
  if (status) {
    filter.status = status;
  }

  return RewardRedemption.find(filter)
    .sort({ created_at: -1 })
    .populate("reward_id", "_id name description points_required quantity image_url")
    .lean();
};

module.exports = {
  getMemberRewards,
  getMemberRewardDetail,
  redeemReward,
  getMyRedemptionHistory,
};
