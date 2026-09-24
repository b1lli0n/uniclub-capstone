const Club = require("../../models/club.model");
const ClubMember = require("../../models/club_member.model");
const Event = require("../../models/event.model");
const User = require("../../models/user.model");
const { getStatusError } = require("../../utils/error");

const getMyClubs = async (userId) => {
  const memberships = await ClubMember.find({
    user_id: userId,
    status: "active",
  })
    .sort({ joined_at: -1 })
    .populate("club_id", "_id name logo_url category description status slogan")
    .select("_id club_id role status joined_at")
    .lean();

  if (!memberships || memberships.length === 0) {
    return [];
  }

  const clubIds = memberships
    .map((m) => (m.club_id?._id ? m.club_id._id : m.club_id))
    .filter(Boolean);

  const [memberCounts, eventCounts] = await Promise.all([
    ClubMember.aggregate([
      { $match: { club_id: { $in: clubIds }, status: "active" } },
      { $group: { _id: "$club_id", count: { $sum: 1 } } },
    ]),
    Event.aggregate([
      { $match: { club_id: { $in: clubIds } } },
      { $group: { _id: "$club_id", count: { $sum: 1 } } },
    ]),
  ]);

  const memberCountMap = new Map(
    memberCounts.map((item) => [String(item._id), item.count])
  );
  const eventCountMap = new Map(
    eventCounts.map((item) => [String(item._id), item.count])
  );

  return memberships.map((m) => {
    if (m.club_id && typeof m.club_id === "object") {
      const cId = String(m.club_id._id || m.club_id);
      const mCount = memberCountMap.get(cId) || 0;
      const eCount = eventCountMap.get(cId) || 0;
      m.club_id.member_count = mCount;
      m.club_id.event_count = eCount;
      m.club_id.members_count = mCount;
      m.club_id.events_count = eCount;
      m.club_id.members = mCount;
      m.club_id.events = eCount;
    }
    return m;
  });
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
