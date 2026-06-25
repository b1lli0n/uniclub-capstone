const ClubMember = require("../../models/club_member.model");
const { getStatusError } = require("../../utils/error");

const getMyClubs = async (userId) => {
  return ClubMember.find({
    user_id: userId,
    status: "active",
  })
    .sort({ joined_at: -1 })
    .populate("club_id", "_id name logo_url category description status")
    .select("_id club_id role status joined_at");
};

const leaveClub = async (membership) => {
  if (membership.role !== "member") {
    throw getStatusError("Only members can leave the club", 403);
  }

  membership.status = "left";
  membership.left_at = new Date();
  await membership.save();

  return membership.populate("club_id", "_id name logo_url category");
};

const getClubMembers = async (clubId) => {
  return ClubMember.find({
    club_id: clubId,
    status: "active",
  })
    .sort({ joined_at: 1 })
    .populate("user_id", "_id full_name email avatar_url")
    .select("_id user_id role status joined_at");
};

module.exports = {
  getMyClubs,
  leaveClub,
  getClubMembers,
};
