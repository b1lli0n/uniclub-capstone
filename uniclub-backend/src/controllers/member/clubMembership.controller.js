const mongoose = require("mongoose");
const clubMembershipService = require("../../services/member/clubMembership.service");

const throwBadRequest = (message) => {
  throw Object.assign(new Error(message), { statusCode: 400 });
};

const assertValidObjectId = (id, label) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throwBadRequest(`Invalid ${label}`);
  }
};

const getUserId = (req) => {
  const userId = req.user?._id;

  if (!userId) {
    throw Object.assign(new Error("User ID is required. "), {
      statusCode: 401
    });
  }

  return userId;
};

const getMyClubs = async (req, res, next) => {
  try {
    const memberships = await clubMembershipService.getMyClubs(getUserId(req));

    return res.status(200).json({
      success: true,
      message: "My clubs retrieved successfully",
      data: memberships
    });
  } catch (error) {
    next(error);
  }
};

const leaveClub = async (req, res, next) => {
  try {
    const { clubId } = req.params;
    assertValidObjectId(clubId, "clubId");

    const membership = await clubMembershipService.leaveClub(getUserId(req), clubId);

    return res.status(200).json({
      success: true,
      message: "Left club successfully",
      data: membership
    });
  } catch (error) {
    next(error);
  }
};

const getClubMembers = async (req, res, next) => {
  try {
    const { clubId } = req.params;
    assertValidObjectId(clubId, "clubId");

    const members = await clubMembershipService.getClubMembers(getUserId(req), clubId);

    return res.status(200).json({
      success: true,
      message: "Club members retrieved successfully",
      data: members
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMyClubs,
  leaveClub,
  getClubMembers
};
