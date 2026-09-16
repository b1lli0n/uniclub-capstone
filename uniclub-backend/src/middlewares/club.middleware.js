const mongoose = require("mongoose");
const ClubMember = require("../models/club_member.model");
const Event = require("../models/event.model");
const { getStatusError } = require("../utils/error");

/**
 * Helper to resolve club ID from request params, body, query, or associated event
 */
const resolveClubId = async (req, paramName = "clubId") => {
  let clubId = (
    req.params?.[paramName] ||
    req.params?.clubId ||
    req.params?.club_id ||
    req.body?.club_id ||
    req.body?.clubId ||
    req.query?.club_id ||
    req.query?.clubId
  );

  if (!clubId) {
    const eventId = (
      req.params?.eventId ||
      req.params?.event_id ||
      req.body?.eventId ||
      req.body?.event_id ||
      req.query?.eventId ||
      req.query?.event_id
    );

    if (eventId && mongoose.Types.ObjectId.isValid(eventId)) {
      const event = await Event.findById(eventId).select("club_id");
      if (event && event.club_id) {
        clubId = event.club_id;
        req.event = event;
      }
    }
  }

  return clubId;
};

/**
 * Middleware to check if user has one of the allowed roles in the specified club.
 * If allowedRoles is empty, it verifies that user is an active member of the club.
 *
 * Usage:
 * - requireClubRole(["president", "secretary"], "clubId")
 * - requireClubRole(["president"])
 * - requireClubRole([], "clubId") // Any active club member
 * - requireClubRole("clubId")     // Shorthand for any active member
 */
const requireClubRole = (allowedRoles = [], paramName = "clubId") => {
  if (typeof allowedRoles === "string") {
    paramName = allowedRoles;
    allowedRoles = [];
  }

  return async (req, res, next) => {
    try {
      if (!req.user?.id) {
        return next(getStatusError("User not authenticated", 401));
      }

      const clubId = await resolveClubId(req, paramName);

      if (!clubId || !mongoose.Types.ObjectId.isValid(clubId)) {
        return next(getStatusError(`Invalid ${paramName}`, 400));
      }

      const membership = await ClubMember.findOne({
        user_id: req.user.id,
        club_id: clubId,
        status: "active",
      });

      if (!membership) {
        return next(getStatusError("You are not an active member of this club", 403));
      }

      if (Array.isArray(allowedRoles) && allowedRoles.length > 0 && !allowedRoles.includes(membership.role)) {
        return next(getStatusError("Access denied: insufficient club role", 403));
      }

      req.clubMembership = membership;
      req.clubMember = membership;
      next();
    } catch (error) {
      next(error);
    }
  };
};

module.exports = {
  requireClubRole,
};
