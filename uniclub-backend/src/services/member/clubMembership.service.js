const ClubMember = require("../../models/clubMember.model");
const {
  CLUB_MEMBER_ROLE,
  CLUB_MEMBER_STATUS
} = require("../../utils/constants");

const getMyClubs = async (userId) => {
  return ClubMember.find({
    user_id: userId,
    status: CLUB_MEMBER_STATUS.ACTIVE
  })
    .sort({ joined_at: -1 })
    .populate("club_id", "_id name logo_url category description status")
    .select("_id club_id role status joined_at");
};

const leaveClub = async (userId, clubId) => {
  const membership = await ClubMember.findOne({
    user_id: userId,
    club_id: clubId,
    status: CLUB_MEMBER_STATUS.ACTIVE
  });

  if (!membership) {
    throw Object.assign(new Error("You are not an active member of this club"), {
      statusCode: 404
    });
  }

  if (membership.role !== CLUB_MEMBER_ROLE.MEMBER) {
    throw Object.assign(new Error("Only members can leave the club"), {
      statusCode: 403
    });
  }

  membership.status = CLUB_MEMBER_STATUS.LEFT;
  membership.left_at = new Date();
  await membership.save();

  return membership.populate("club_id", "_id name logo_url category");
};

module.exports = {
  getMyClubs,
  leaveClub
};
