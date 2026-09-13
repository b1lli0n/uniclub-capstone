const clubMembershipService = require("../../services/member/clubMembership.service");
const { getStatusError } = require("../../utils/error");

const getMyClubs = async (req, res, next) => {
  try {
    const data = await clubMembershipService.getMyClubs(req.user.id);

    return res.status(200).json({
      success: true,
      message: "My clubs retrieved successfully",
      data,
    });
  } catch (error) {
    next(error);
  }
};

const leaveClub = async (req, res, next) => {
  try {
    const data = await clubMembershipService.leaveClub(req.clubMembership);

    return res.status(200).json({
      success: true,
      message: "Left club successfully",
      data,
    });
  } catch (error) {
    next(error);
  }
};

const getClubMembers = async (req, res, next) => {
  try {
    const data = await clubMembershipService.getClubMembers(req.params.clubId);

    return res.status(200).json({
      success: true,
      message: "Club members retrieved successfully",
      data,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMyClubs,
  leaveClub,
  getClubMembers,
};
