const PointRule = require("../../models/point_rule.model");
const ActionType = require("../../models/action_type.model");
const Club = require("../../models/club.model");
const ClubMember = require("../../models/club_member.model");
const ContributionLog = require("../../models/contribution_log.model");
const { sendPointsAwardedEmail } = require("../email.service");
const { getStatusError } = require("../../utils/error");
const mongoose = require("mongoose");

const getPointRules = async (clubId) => {
  if (!mongoose.Types.ObjectId.isValid(clubId)) {
    throw getStatusError("Invalid club ID", 400);
  }

  return PointRule.find({ club_id: clubId })
    .populate("action_type_id", "_id code name description")
    .sort({ created_at: -1 });
};

const createPointRule = async (presidentId, clubId, data) => {
  const { action_type_id, reward_point, limit_per_event, limit_per_day, is_active } = data;

  if (!mongoose.Types.ObjectId.isValid(clubId)) {
    throw getStatusError("Invalid club ID", 400);
  }

  if (!mongoose.Types.ObjectId.isValid(action_type_id)) {
    throw getStatusError("Invalid action type ID", 400);
  }

  // Verify ActionType exists
  const actionType = await ActionType.findById(action_type_id);
  if (!actionType) {
    throw getStatusError("Action type not found", 404);
  }

  // Verify club exists
  const club = await Club.findById(clubId);
  if (!club) {
    throw getStatusError("Club not found", 404);
  }

  // Enforce one point rule per action type per club
  const existingRule = await PointRule.findOne({ club_id: clubId, action_type_id });
  if (existingRule) {
    throw getStatusError("A point rule for this action type already exists in this club", 400);
  }

  // Validation values
  if (typeof reward_point !== "number" || isNaN(reward_point)) {
    throw getStatusError("Reward point must be a valid number", 400);
  }
  if (typeof limit_per_event !== "number" || limit_per_event < 0 || isNaN(limit_per_event)) {
    throw getStatusError("Limit per event must be a positive number", 400);
  }
  if (typeof limit_per_day !== "number" || limit_per_day < 0 || isNaN(limit_per_day)) {
    throw getStatusError("Limit per day must be a positive number", 400);
  }

  const pointRule = await PointRule.create({
    club_id: clubId,
    action_type_id,
    reward_point,
    limit_per_event,
    limit_per_day,
    is_active: is_active !== undefined ? Boolean(is_active) : false,
    created_by: presidentId,
  });

  return pointRule.populate("action_type_id", "_id code name description");
};

const updatePointRule = async (presidentId, clubId, ruleId, data) => {
  const { reward_point, limit_per_event, limit_per_day } = data;

  if (!mongoose.Types.ObjectId.isValid(clubId) || !mongoose.Types.ObjectId.isValid(ruleId)) {
    throw getStatusError("Invalid club ID or rule ID", 400);
  }

  const pointRule = await PointRule.findOne({ _id: ruleId, club_id: clubId });
  if (!pointRule) {
    throw getStatusError("Point rule not found in this club", 404);
  }

  if (reward_point !== undefined) {
    if (typeof reward_point !== "number" || isNaN(reward_point)) {
      throw getStatusError("Reward point must be a valid number", 400);
    }
    pointRule.reward_point = reward_point;
  }

  if (limit_per_event !== undefined) {
    if (typeof limit_per_event !== "number" || limit_per_event < 0 || isNaN(limit_per_event)) {
      throw getStatusError("Limit per event must be a positive number", 400);
    }
    pointRule.limit_per_event = limit_per_event;
  }

  if (limit_per_day !== undefined) {
    if (typeof limit_per_day !== "number" || limit_per_day < 0 || isNaN(limit_per_day)) {
      throw getStatusError("Limit per day must be a positive number", 400);
    }
    pointRule.limit_per_day = limit_per_day;
  }

  await pointRule.save();
  return pointRule.populate("action_type_id", "_id code name description");
};

const togglePointRuleStatus = async (presidentId, clubId, ruleId, is_active) => {
  if (!mongoose.Types.ObjectId.isValid(clubId) || !mongoose.Types.ObjectId.isValid(ruleId)) {
    throw getStatusError("Invalid club ID or rule ID", 400);
  }

  const pointRule = await PointRule.findOne({ _id: ruleId, club_id: clubId });
  if (!pointRule) {
    throw getStatusError("Point rule not found in this club", 404);
  }

  pointRule.is_active = Boolean(is_active);
  await pointRule.save();

  return pointRule.populate("action_type_id", "_id code name description");
};

// Manually award points to a member (for testability and custom points allocation)
const awardPointsManually = async (presidentId, clubId, memberId, { rule_id, reward_point, reason, event_id }) => {
  if (!mongoose.Types.ObjectId.isValid(clubId) || !mongoose.Types.ObjectId.isValid(memberId)) {
    throw getStatusError("Invalid club ID or member ID", 400);
  }

  const member = await ClubMember.findOne({ _id: memberId, club_id: clubId, status: "active" });
  if (!member) {
    throw getStatusError("Active club member not found", 404);
  }

  let finalPoints = reward_point;
  let ruleId = null;
  let actionTypeId = null;

  if (rule_id) {
    if (!mongoose.Types.ObjectId.isValid(rule_id)) {
      throw getStatusError("Invalid rule ID", 400);
    }
    const rule = await PointRule.findOne({ _id: rule_id, club_id: clubId, is_active: true });
    if (!rule) {
      throw getStatusError("Active point rule not found", 404);
    }
    ruleId = rule._id;
    actionTypeId = rule.action_type_id;
    if (finalPoints === undefined || finalPoints === null) {
      finalPoints = rule.reward_point;
    }
  } else {
    const fallbackAction = (await ActionType.findOne({ code: "performance" })) || (await ActionType.findOne({}));
    if (fallbackAction) {
      actionTypeId = fallbackAction._id;
    }
    if (finalPoints === undefined || finalPoints === null) {
      throw getStatusError("Reward point must be provided", 400);
    }
  }

  if (typeof finalPoints !== "number" || isNaN(finalPoints)) {
    throw getStatusError("Reward point must be a valid number", 400);
  }

  if (!reason || !reason.trim()) {
    throw getStatusError("Reason is required for manual points adjustment", 400);
  }

  // Calculate month_key
  const now = new Date();
  const monthKey = new Date(now.getFullYear(), now.getMonth(), 1);

  // Update member points cache
  member.reward_point = (member.reward_point || 0) + finalPoints;
  if (member.reward_point < 0) {
    member.reward_point = 0; // prevent negative total points
  }
  await member.save();

  // Create contribution log
  const log = await ContributionLog.create({
    membership_id: member._id,
    event_id: event_id && mongoose.Types.ObjectId.isValid(event_id) ? event_id : new mongoose.Types.ObjectId(), // fallback/custom event ID if not provided
    rule_id: ruleId || new mongoose.Types.ObjectId(), // mock/fallback rule ID if manual without rule
    action_type_id: actionTypeId || new mongoose.Types.ObjectId(),
    reward_point: finalPoints,
    month_key: monthKey,
  });

  // Async send email notification
  ClubMember.findById(member._id).populate("user_id").populate("club_id").then((populated) => {
    if (populated && populated.user_id && populated.user_id.email) {
      sendPointsAwardedEmail({
        toEmail: populated.user_id.email,
        userName: populated.user_id.full_name || "Thành viên",
        clubName: populated.club_id?.name || "Câu lạc bộ",
        points: finalPoints,
        reason: reason.trim(),
        newTotal: member.reward_point,
      }).catch((err) => console.error("[Points Email Error]", err));
    }
  }).catch((err) => console.error("[Points Email Populate Error]", err));

  return {
    success: true,
    member: {
      _id: member._id,
      user_id: member.user_id,
      reward_point: member.reward_point,
    },
    log,
  };
};

const deletePointRule = async (presidentId, clubId, ruleId) => {
  if (!mongoose.Types.ObjectId.isValid(clubId) || !mongoose.Types.ObjectId.isValid(ruleId)) {
    throw getStatusError("Invalid club ID or rule ID", 400);
  }

  const pointRule = await PointRule.findOneAndDelete({ _id: ruleId, club_id: clubId });
  if (!pointRule) {
    throw getStatusError("Point rule not found in this club", 404);
  }

  return { success: true, message: "Point rule deleted successfully" };
};

const getActionTypes = async () => {
  return ActionType.find({ is_Active: true }).sort({ created_at: 1 });
};

module.exports = {
  getPointRules,
  createPointRule,
  updatePointRule,
  togglePointRuleStatus,
  awardPointsManually,
  getActionTypes,
  deletePointRule,
};
