const clubMemberService = require("../services/clubMember.service");

const getClubMembersForManagement = async (req, res, next) => {
  try {
    const { clubId } = req.params;
    const { search, status, sortBy, sortOrder } = req.query;

    const data = await clubMemberService.getClubMembersForManagement({
      clubId,
      currentUserId: req.user.id,
      search,
      status,
      sortBy,
      sortOrder,
    });

    return res.status(200).json({
      success: true,
      message: "Club members fetched successfully",
      data,
    });
  } catch (error) {
    next(error);
  }
};

const removeMember = async (req, res, next) => {
  try {
    const { clubId, memberId } = req.params;

    const data = await clubMemberService.removeMember({
      clubId,
      memberId,
      currentUserId: req.user.id,
    });

    return res.status(200).json({
      success: true,
      message: "Member removed successfully",
      data,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getClubMembersForManagement,
  removeMember,
};