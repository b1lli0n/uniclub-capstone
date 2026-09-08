const mongoose = require("mongoose");
const ClubMember = require("../models/club_member.model");
const { getStatusError } = require("../utils/error");

/**
 * Helper to resolve club ID from request params, body, or query
 */
const resolveClubId = (req, paramName) => {
  return req.params[paramName] || req.body?.club_id || req.query?.club_id;
};

/**
 * Middleware to check if user is an active member of the specified club
 * Usage: requireClubMember("clubId")
 */
const requireClubMember = (paramName = "clubId") => {
  return async (req, res, next) => {
    try {
      if (!req.user?.id) {
        return next(getStatusError("User not authenticated", 401));
      }

      const clubId = resolveClubId(req, paramName);

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

      req.clubMembership = membership;
      req.clubMember = membership;
      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Middleware to check if user has one of the allowed roles in the specified club
 * Usage: requireClubRole(["president", "secretary"], "clubId")
 */
const requireClubRole = (allowedRoles = [], paramName = "clubId") => {
  return async (req, res, next) => {
    try {
      if (!req.user?.id) {
        return next(getStatusError("User not authenticated", 401));
      }

      const clubId = resolveClubId(req, paramName);

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

      if (allowedRoles.length > 0 && !allowedRoles.includes(membership.role)) {
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
  requireClubMember,
  requireClubRole,
};
