const mongoose = require("mongoose");
const Club = require("../../models/club.model");
const ClubMember = require("../../models/club_member.model");
const Reward = require("../../models/reward.model");
const RewardTransaction = require("../../models/rewardTransaction.model");
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

  const filter = { club_id: clubId, is_active: true };

  if (search?.trim()) {
    const keyword = search.trim();
    filter.$or = [
      { name: { $regex: keyword, $options: "i" } },
      { description: { $regex: keyword, $options: "i" } },
    ];
  }

  const rewards = await Reward.find(filter)
    .sort({ created_at: -1 })
    .select("_id name description points_required quantity is_active created_at");

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
      .select("_id club_id name description points_required quantity is_active created_at updated_at"),
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

const redeemReward = async ({ clubId, rewardId, userId }) => {
  validateId(clubId, "clubId");
  validateId(rewardId, "rewardId");

  const session = await mongoose.startSession();

  try {
    let redemption;

    await session.withTransaction(async () => {
      const club = await Club.findOne({ _id: clubId, status: "active" }).session(session);
      if (!club) {
        throw getStatusError("Club not found or inactive", 404);
      }

      const reward = await Reward.findOne({
        _id: rewardId,
        club_id: clubId,
        is_active: true,
      }).session(session);

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
      }).session(session);

      if (!membership) {
        throw getStatusError("You are not an active member of this club", 403);
      }

      if (membership.reward_point < reward.points_required) {
        throw getStatusError("Insufficient reward points", 400);
      }

      membership.reward_point -= reward.points_required;
      reward.quantity -= 1;

      await Promise.all([membership.save({ session }), reward.save({ session })]);

      const created = await RewardTransaction.create(
        [
          {
            membership_id: membership._id,
            reward_id: reward._id,
            points_spent: reward.points_required,
            status: 0,
          },
        ],
        { session }
      );

      redemption = created[0];
    });

    await redemption.populate("reward_id", "_id name description points_required quantity");

    return redemption;
  } finally {
    await session.endSession();
  }
};

const getMyRedemptionHistory = async ({ clubId, userId, status }) => {
  validateId(clubId, "clubId");
  const membership = await getActiveMembership(clubId, userId);

  const allowedStatuses = ["0", "1", "2", "3"];
  if (status && !allowedStatuses.includes(status)) {
    throw getStatusError("Invalid status. Allowed values: 0 (pending), 1 (approved), 2 (rejected), 3 (completed)", 400);
  }

  const filter = { membership_id: membership._id };
  if (status) {
    filter.status = Number(status);
  }

  return RewardTransaction.find(filter)
    .sort({ created_at: -1 })
    .populate("reward_id", "_id name description points_required quantity")
    .select("_id reward_id points_spent status created_at updated_at");
};

module.exports = {
  getMemberRewards,
  getMemberRewardDetail,
  redeemReward,
  getMyRedemptionHistory,
};
