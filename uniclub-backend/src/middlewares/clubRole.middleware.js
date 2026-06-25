const mongoose = require("mongoose");
const ClubMember = require("../models/club_member.model");

/**
 * Middleware để check role cho Club Member (member, president, secretary, treasurer, event_manager)
 * Usage: requireClubRole(["president"]) hoặc requireClubRole(["president", "secretary"])
 */
const requireClubRole = (allowedRoles = []) => {
  return async (req, res, next) => {
    try {
      const clubId = req.params.clubId || req.body.club_id;

      if (!clubId || !mongoose.isValidObjectId(clubId)) {
        const error = new Error("Invalid club ID");
        error.statusCode = 400;
        throw error;
      }

      if (!req.user || !req.user.id) {
        const error = new Error("Authentication required");
        error.statusCode = 401;
        throw error;
      }

      const clubMember = await ClubMember.findOne({
        club_id: clubId,
        user_id: req.user.id,
        status: "active",
      });

      if (!clubMember) {
        const error = new Error("You are not a member of this club");
        error.statusCode = 403;
        throw error;
      }

      if (allowedRoles.length > 0 && !allowedRoles.includes(clubMember.role)) {
        const error = new Error("Permission denied");
        error.statusCode = 403;
        throw error;
      }

      req.clubMember = clubMember;
      next();
    } catch (error) {
      next(error);
    }
  };
};

module.exports = {
  requireClubRole,
};