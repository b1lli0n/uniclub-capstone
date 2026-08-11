const ActionType = require("../models/action_type.model");
const PointRule = require("../models/point_rule.model");
const ClubMember = require("../models/club_member.model");
const ContributionLog = require("../models/contribution_log.model");
const { sendPointsAwardedEmail } = require("./email.service");
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

    // --- ENFORCE COUNT-BASED LIMITS ---
    const pointsToAward = rule.reward_point;

    // A. Check limit_per_event (Max number of TIMES per event)
    if (rule.limit_per_event && rule.limit_per_event > 0) {
      const eventLogsCount = await ContributionLog.countDocuments({
        membership_id: member._id,
        event_id: eventId,
        action_type_id: actionType._id,
      });

      if (eventLogsCount >= rule.limit_per_event) {
        console.log(`[Points Hook] Member ${member._id} reached limit_per_event count (${rule.limit_per_event}) for event ${eventId}.`);
        return null;
      }
    }

    // B. Check limit_per_day (Max number of TIMES per day)
    if (rule.limit_per_day && rule.limit_per_day > 0) {
      const startOfToday = new Date();
      startOfToday.setHours(0, 0, 0, 0);
      const endOfToday = new Date();
      endOfToday.setHours(23, 59, 59, 999);

      const dayLogsCount = await ContributionLog.countDocuments({
        membership_id: member._id,
        action_type_id: actionType._id,
        created_at: { $gte: startOfToday, $lte: endOfToday },
      });

      if (dayLogsCount >= rule.limit_per_day) {
        console.log(`[Points Hook] Member ${member._id} reached limit_per_day count (${rule.limit_per_day}) for action "${actionTypeCode}" today.`);
        return null;
      }
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

    // Async send email notification
    ClubMember.findById(member._id).populate("user_id").populate("club_id").then((populated) => {
      if (populated && populated.user_id && populated.user_id.email) {
        sendPointsAwardedEmail({
          toEmail: populated.user_id.email,
          userName: populated.user_id.full_name || "Thành viên",
          clubName: populated.club_id?.name || "Câu lạc bộ",
          points: pointsToAward,
          reason: actionType.name || "Tích lũy điểm rèn luyện sự kiện",
          newTotal: member.reward_point,
        }).catch((err) => console.error("[Points Hook Email Error]", err));
      }
    }).catch((err) => console.error("[Points Hook Email Populate Error]", err));

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
