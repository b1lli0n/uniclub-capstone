const mongoose = require("mongoose");
const ClubMember = require("../models/club_member.model");
const { getStatusError } = require("../utils/error");

/**
 * Helper to resolve club ID from request params, body, or query
 */
const resolveClubId = (req, paramName = "clubId") => {
  return (
    req.params?.[paramName] ||
    req.params?.clubId ||
    req.params?.club_id ||
    req.body?.club_id ||
    req.body?.clubId ||
    req.query?.club_id ||
    req.query?.clubId
  );
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
