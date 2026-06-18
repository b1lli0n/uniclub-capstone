const mongoose = require("mongoose");
const ClubMember = require("../models/clubMember.model");
const { getStatusError } = require("../utils/error");

const resolveClubId = (req, paramName) => {
  return req.params[paramName] || req.body?.club_id || req.query?.club_id;
};

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
        status: "active"
      });

      if (!membership) {
        return next(getStatusError("You are not an active member of this club", 403));
      }

      req.clubMembership = membership;
      next();
    } catch (error) {
      next(error);
    }
  };
};

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
        status: "active"
      });

      if (!membership) {
        return next(getStatusError("You are not an active member of this club", 403));
      }

      if (allowedRoles.length > 0 && !allowedRoles.includes(membership.role)) {
        return next(getStatusError("Access denied: insufficient club role", 403));
      }

      req.clubMembership = membership;
      next();
    } catch (error) {
      next(error);
    }
  };
};

module.exports = {
  requireClubMember,
  requireClubRole
};
