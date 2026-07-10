const ActionType = require("../models/action_type.model");
const PointRule = require("../models/point_rule.model");
const ClubMember = require("../models/club_member.model");
const ContributionLog = require("../models/contribution_log.model");
const mongoose = require("mongoose");

/**
 * Automatically evaluates point rules and awards points to a club member.
 * Strictly respects limit_per_event and limit_per_day configurations (Rule Limit Hook).
 * 
 * @param {Object} params
 * @param {string|ObjectId} params.clubId - The club hosting the event
 * @param {string|ObjectId} params.userId - The student receiving points
 * @param {string} params.actionTypeCode - "attendance" or "feedback"
 * @param {string|ObjectId} params.eventId - The event ID
 * @param {string|ObjectId} [params.presidentId] - The issuer (optional)
 * @returns {Promise<Object|null>} The contribution log if points were awarded, null otherwise
 */
const awardRewardPoints = async ({ clubId, userId, actionTypeCode, eventId, presidentId }) => {
  try {
    // 1. Resolve ActionType
    const actionType = await ActionType.findOne({ code: actionTypeCode, is_Active: true });
    if (!actionType) {
      console.log(`[Points Hook] Action type code "${actionTypeCode}" not found or inactive.`);
      return null;
    }

    // 2. Resolve Active PointRule for this club and action type
    const rule = await PointRule.findOne({
      club_id: clubId,
      action_type_id: actionType._id,
      is_active: true,
    });
    if (!rule) {
      console.log(`[Points Hook] No active point rule set for club ${clubId} and action "${actionTypeCode}".`);
      return null;
    }

    // 3. Resolve active membership for the student in this club
    const member = await ClubMember.findOne({
      user_id: userId,
      club_id: clubId,
      status: "active",
    });
    if (!member) {
      console.log(`[Points Hook] User ${userId} is not an active member of club ${clubId}. Cannot award points.`);
      return null;
    }

    let pointsToAward = rule.reward_point;

    // --- ENFORCE HƯỚNG 1: CHECK LIMITS ---

    // A. Check limit_per_event
    const eventLogs = await ContributionLog.find({
      membership_id: member._id,
      event_id: eventId,
      action_type_id: actionType._id,
    }).lean();

    const pointsAlreadyEarnedInEvent = eventLogs.reduce((sum, log) => sum + (log.reward_point || 0), 0);
    if (pointsAlreadyEarnedInEvent >= rule.limit_per_event) {
      console.log(`[Points Hook] Member ${member._id} reached limit_per_event (${rule.limit_per_event}) for event ${eventId}.`);
      return null;
    }

    if (pointsAlreadyEarnedInEvent + pointsToAward > rule.limit_per_event) {
      pointsToAward = rule.limit_per_event - pointsAlreadyEarnedInEvent;
    }

    // B. Check limit_per_day
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    const dayLogs = await ContributionLog.find({
      membership_id: member._id,
      action_type_id: actionType._id,
      created_at: { $gte: startOfToday, $lte: endOfToday },
    }).lean();

    const pointsAlreadyEarnedToday = dayLogs.reduce((sum, log) => sum + (log.reward_point || 0), 0);
    if (pointsAlreadyEarnedToday >= rule.limit_per_day) {
      console.log(`[Points Hook] Member ${member._id} reached limit_per_day (${rule.limit_per_day}) for action "${actionTypeCode}" today.`);
      return null;
    }

    if (pointsAlreadyEarnedToday + pointsToAward > rule.limit_per_day) {
      pointsToAward = rule.limit_per_day - pointsAlreadyEarnedToday;
    }

    if (pointsToAward <= 0) {
      console.log(`[Points Hook] Points to award resolved to ${pointsToAward}. Skipping.`);
      return null;
    }

    // --- PERFORM AWARD ---

    // Update ClubMember reward_point cache
    member.reward_point = (member.reward_point || 0) + pointsToAward;
    await member.save();

    // Calculate month_key
    const now = new Date();
    const monthKey = new Date(now.getFullYear(), now.getMonth(), 1);

    // Save Contribution Log
    const log = await ContributionLog.create({
      membership_id: member._id,
      event_id: eventId,
      rule_id: rule._id,
      action_type_id: actionType._id,
      reward_point: pointsToAward,
      month_key: monthKey,
    });

    console.log(`[Points Hook] Successfully awarded ${pointsToAward} points to member ${member._id} (Rule: ${rule._id}).`);
    return log;
  } catch (error) {
    console.error("[Points Hook] Error in awardRewardPoints:", error);
    return null;
  }
};

module.exports = {
  awardRewardPoints,
};
