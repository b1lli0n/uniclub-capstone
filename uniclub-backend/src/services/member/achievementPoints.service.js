const PointRule = require("../../models/point_rule.model");
const ClubMember = require("../../models/club_member.model");
const Profile = require("../../models/profile.model");
const ContributionLog = require("../../models/contribution_log.model");
const { getStatusError } = require("../../utils/error");
const mongoose = require("mongoose");

const getLeaderboard = async (clubId) => {
  if (!mongoose.Types.ObjectId.isValid(clubId)) {
    throw getStatusError("Invalid club ID", 400);
  }

  // 1. Fetch all active members of the club
  const members = await ClubMember.find({ club_id: clubId, status: "active" })
    .populate("user_id", "_id full_name email avatar_url")
    .lean();

  if (members.length === 0) {
    return [];
  }

  // 2. Fetch profiles to get student_code
  const userIds = members.map((m) => m.user_id._id);
  const profiles = await Profile.find({ user_id: { $in: userIds } })
    .select("user_id student_code")
    .lean();

  const profileMap = new Map(
    profiles.map((p) => [String(p.user_id), p])
  );

  // 3. Aggregate monthly points for these members
  const now = new Date();
  const monthKey = new Date(now.getFullYear(), now.getMonth(), 1);

  const memberIds = members.map((m) => m._id);
  const monthlyLogs = await ContributionLog.aggregate([
    {
      $match: {
        membership_id: { $in: memberIds },
        month_key: monthKey,
      },
    },
    {
      $group: {
        _id: "$membership_id",
        monthly_points: { $sum: "$reward_point" },
      },
    },
  ]);

  const monthlyPointsMap = new Map(
    monthlyLogs.map((log) => [String(log._id), log.monthly_points])
  );

  // 4. Map everything together
  const leaderboard = members.map((member) => {
    const profile = profileMap.get(String(member.user_id._id));
    const monthlyPoints = monthlyPointsMap.get(String(member._id)) || 0;

    return {
      membership_id: member._id,
      user: {
        _id: member.user_id._id,
        full_name: member.user_id.full_name,
        email: member.user_id.email,
        avatar_url: member.user_id.avatar_url,
        student_code: profile?.student_code || "N/A",
      },
      role: member.role,
      joined_at: member.joined_at,
      total_points: member.reward_point || 0,
      monthly_points: monthlyPoints,
    };
  });

  // 5. Sort by monthly points descending, then by total points descending, then by joined_at ascending
  leaderboard.sort((a, b) => {
    if (b.monthly_points !== a.monthly_points) {
      return b.monthly_points - a.monthly_points;
    }
    if (b.total_points !== a.total_points) {
      return b.total_points - a.total_points;
    }
    return new Date(a.joined_at) - new Date(b.joined_at);
  });

  return leaderboard;
};

const getActivePointRules = async (clubId) => {
  if (!mongoose.Types.ObjectId.isValid(clubId)) {
    throw getStatusError("Invalid club ID", 400);
  }

  return PointRule.find({ club_id: clubId, is_active: true })
    .populate("action_type_id", "_id code name description")
    .sort({ created_at: -1 });
};

const getMyContributionLogs = async (userId, clubId, { page = 1, limit = 10 } = {}) => {
  if (!mongoose.Types.ObjectId.isValid(clubId)) {
    throw getStatusError("Invalid club ID", 400);
  }

  // Find membership
  const member = await ClubMember.findOne({
    user_id: userId,
    club_id: clubId,
    status: "active",
  });

  if (!member) {
    throw getStatusError("You are not an active member of this club", 403);
  }

  const skip = (page - 1) * limit;

  const [logs, total] = await Promise.all([
    ContributionLog.find({ membership_id: member._id })
      .populate("event_id", "_id title")
      .populate("action_type_id", "_id code name description")
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    ContributionLog.countDocuments({ membership_id: member._id }),
  ]);

  return {
    logs: logs.map((log) => ({
      _id: log._id,
      event: log.event_id ? { _id: log.event_id._id, title: log.event_id.title } : null,
      action_type: log.action_type_id
        ? { _id: log.action_type_id._id, code: log.action_type_id.code, name: log.action_type_id.name }
        : null,
      reward_point: log.reward_point,
      created_at: log.created_at,
    })),
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      pages: Math.ceil(total / limit),
    },
  };
};

module.exports = {
  getLeaderboard,
  getActivePointRules,
  getMyContributionLogs,
};
