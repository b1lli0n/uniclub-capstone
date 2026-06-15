const ClubMember = require("../../models/clubMember.model");
const { CLUB_MEMBER_STATUS } = require("../../utils/constants");

const getMyClubs = async (userId) => {
  return ClubMember.find({
    user_id: userId,
    status: CLUB_MEMBER_STATUS.ACTIVE
  })
    .sort({ joined_at: -1 })
    .populate("club_id", "_id name logo_url category description status")
    .select("_id club_id role status joined_at");
};

module.exports = {
  getMyClubs
};
