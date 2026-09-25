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

const calculateAvailablePoints = async (membershipId, currentRewardPoint = 0) => {
  const pendingRedemptions = await RewardRedemption.find({
    membership_id: membershipId,
    status: "pending",
  });
  const pendingPoints = pendingRedemptions.reduce((sum, r) => sum + (r.total_point || 0), 0);
  const memberPoints = Number(currentRewardPoint) || 0;
  const availablePoints = Math.max(memberPoints - pendingPoints, 0);
  return { availablePoints, pendingPoints, memberPoints };
};

const getMemberRewards = async ({ clubId, userId, search }) => {
  validateId(clubId, "clubId");
  const membership = await getActiveMembership(clubId, userId);

  const filter = {
    club_id: clubId,
    status: "active",
  };

  if (search?.trim()) {
    const keyword = search.trim();
    filter.name = { $regex: keyword, $options: "i" };
  }

  const [rewards, { availablePoints, pendingPoints, memberPoints }] = await Promise.all([
    Reward.find(filter)
      .sort({ created_at: -1 })
      .select("_id name description points_required point_cost image_url quantity status created_at"),
    calculateAvailablePoints(membership._id, membership.reward_point),
  ]);

  const mappedRewards = rewards.map((r) => {
    const doc = r.toObject ? r.toObject() : r;
    const cost = doc.points_required ?? doc.point_cost ?? 0;
    return {
      ...doc,
      points_required: cost,
      point_cost: cost,
    };
  });

  return {
    available_points: availablePoints,
    total_points: memberPoints,
    pending_points: pendingPoints,
    rewards: mappedRewards,
  };
};

const getMemberRewardDetail = async ({ clubId, rewardId, userId }) => {
  validateId(clubId, "clubId");
  validateId(rewardId, "rewardId");

  const [membership, reward] = await Promise.all([
    getActiveMembership(clubId, userId),
    Reward.findOne({ _id: rewardId, club_id: clubId, status: "active" })
      .populate("club_id", "_id name logo_url")
      .select("_id club_id name description points_required point_cost image_url quantity status created_at updated_at"),
  ]);

  if (!reward) {
    throw getStatusError("Reward not found", 404);
  }

  const { availablePoints, pendingPoints, memberPoints } = await calculateAvailablePoints(
    membership._id,
    membership.reward_point
  );

  const cost = reward.points_required ?? reward.point_cost ?? 0;

  return {
    available_points: availablePoints,
    total_points: memberPoints,
    pending_points: pendingPoints,
    can_redeem: reward.quantity > 0 && availablePoints >= cost,
    reward: {
      ...reward.toObject(),
      points_required: cost,
      point_cost: cost,
    },
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

  const membership = await getActiveMembership(clubId, userId);

  const { availablePoints } = await calculateAvailablePoints(
    membership._id,
    membership.reward_point
  );

  const cost = reward.points_required ?? reward.point_cost ?? 100;
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

  await redemption.populate("reward_id", "_id name description points_required quantity image_url");

  // Trigger Email notifications to Leader & Student
  try {
    const { 
      sendRedemptionRequestEmailToLeader,
      sendRedemptionSubmittedEmailToStudent,
    } = require("../email.service");
    const User = require("../../models/user.model");
    const ClubMember = require("../../models/club_member.model");
    const userDoc = await User.findById(userId);

    let leaderEmail = "";
    if (club?.president_id) {
      const leaderId = club.president_id._id || club.president_id;
      const leaderUser = await User.findById(leaderId);
      if (leaderUser?.email) leaderEmail = leaderUser.email;
    }
    if (!leaderEmail && club?._id) {
      const currentPresident = await ClubMember.findOne({ club_id: club._id, role: "president", status: "active" }).populate("user_id");
      if (currentPresident?.user_id?.email) leaderEmail = currentPresident.user_id.email;
    }
    if (!leaderEmail) {
      leaderEmail = process.env.EMAIL_USER || "uniclub2402@gmail.com";
    }

    if (leaderEmail) {
      await sendRedemptionRequestEmailToLeader({
        leaderEmail,
        userName: userDoc?.full_name || "UniClub Student",
        clubName: club?.name || "Club",
        rewardTitle: reward?.name || "Reward",
        pointCost: cost,
      }).catch((err) => console.error("[Redeem Leader Email Error]:", err));
    }

    if (userDoc?.email) {
      await sendRedemptionSubmittedEmailToStudent({
        toEmail: userDoc.email,
        userName: userDoc.full_name || "Member",
        clubName: club?.name || "Club",
        rewardTitle: reward?.name || "Reward",
        pointCost: cost,
      }).catch((err) => console.error("[Redeem Student Email Error]:", err));
    }
  } catch (emailErr) {
    console.error("[Redeem Hook] Email trigger error:", emailErr);
  }

  return redemption;
};

const getMyRedemptionHistory = async ({ clubId, userId, status }) => {
  validateId(clubId, "clubId");
  const membership = await getActiveMembership(clubId, userId);

  const allowedStatuses = ["pending", "approved", "rejected", "reviewed"];
  if (status && !allowedStatuses.includes(status)) {
    throw getStatusError("Invalid status. Allowed values: pending, approved, rejected, reviewed", 400);
  }

  const filter = { club_id: clubId, membership_id: membership._id };
  if (status) {
    if (status === "reviewed") {
      filter.status = { $in: ["approved", "rejected"] };
    } else {
      filter.status = status;
    }
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
