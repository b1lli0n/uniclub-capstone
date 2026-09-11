const mongoose = require("mongoose");
const Club = require("../models/club.model");
const ClubMember = require("../models/club_member.model");
const Event = require("../models/event.model");
const ClubCreationRequest = require("../models/club_creation_requests.model");
const User = require("../models/user.model");

const buildClubQuery = ({ category, search }) => {
  const filter = { status: "active" };

  if (category) {
    filter.category = category;
  }

  if (search) {
    filter.name = { $regex: search, $options: "i" };
  }

  return filter;
};

const buildSortOptions = (sortBy) => {
  if (!sortBy) {
    return { created_at: -1 };
  }

  const normalized = sortBy.toLowerCase();

  if (normalized === "name") {
    return { name: 1 };
  }

  if (normalized === "created_at" || normalized === "date") {
    return { created_at: -1 };
  }

  return { [sortBy]: 1 };
};


// UC - View List of Clubs
const getAllClubs = async ({ category, sortBy, search }) => {
  const filter = buildClubQuery({ category, search });
  const sortOptions = buildSortOptions(sortBy);

  const clubs = await Club.find(filter).sort(sortOptions).lean();

  if (!clubs || clubs.length === 0) {
    return [];
  }

  const clubIds = clubs.map((c) => c._id);

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

  return clubs.map((club) => ({
    ...club,
    member_count: memberCountMap.get(String(club._id)) || 0,
    event_count: eventCountMap.get(String(club._id)) || 0,
  }));
};


// UC - View Details of a Club
const getClubById = async (id) => {
  if (!mongoose.isValidObjectId(id)) {
    const error = new Error("Invalid club ID");
    error.statusCode = 400;
    throw error;
  }

  const club = await Club.findOne({ _id: id, status: "active" }).lean();

  if (!club) {
    const error = new Error("Club not found");
    error.statusCode = 404;
    throw error;
  }

  const [memberCount, eventCount] = await Promise.all([
    ClubMember.countDocuments({ club_id: id, status: "active" }),
    Event.countDocuments({ club_id: id }),
  ]);

  return {
    ...club,
    member_count: memberCount,
    event_count: eventCount,
  };
};

// UC - Request to Create a New Club
const requestCreateClub = async ({
  club_name,
  description,
  reason,
  logo_url,
  requested_by,
  member_ids,
}) => {
  const clubNameRegex = { $regex: `^${club_name.trim()}$`, $options: "i" };

  const existedClub = await Club.findOne({
    name: clubNameRegex,
    status: "active",
  });

  if (existedClub) {
    const error = new Error("Club name already exists");
    error.statusCode = 409;
    throw error;
  }

  const pendingRequest = await ClubCreationRequest.findOne({
    club_name: clubNameRegex,
    status: "pending",
  });

  if (pendingRequest) {
    const error = new Error("A pending request for this club already exists");
    error.statusCode = 409;
    throw error;
  }

  const uniqueMemberIds = [...new Set(member_ids.map(String))];

  if (uniqueMemberIds.length < 10) {
    const error = new Error("Club creation request must have at least 10 members");
    error.statusCode = 400;
    throw error;
  }

  const invalidMemberId = uniqueMemberIds.find(
    (id) => !mongoose.isValidObjectId(id)
  );

  if (invalidMemberId) {
    const error = new Error("Each member must be a valid ID");
    error.statusCode = 400;
    throw error;
  }

  const existingUsersCount = await User.countDocuments({
    _id: { $in: uniqueMemberIds },
    status: "active",
  });

  if (existingUsersCount !== uniqueMemberIds.length) {
    const error = new Error("Some members do not exist or are not active");
    error.statusCode = 400;
    throw error;
  }

  const request = await ClubCreationRequest.create({
    club_name: club_name.trim(),
    description: description || "",
    reason: reason.trim(),
    logo_url: logo_url.trim(),
    requested_by,
    member_ids: uniqueMemberIds,
    status: "pending",
    reviewed_by: null,
    review_note: null,
    reviewed_at: null,
  });

  // Trigger Email Notification to Student Affairs (uniclub2402@gmail.com)
  try {
    const { sendNewClubCreationRequestEmailToSA } = require("./email.service");
    const user = await User.findById(requested_by);
    sendNewClubCreationRequestEmailToSA({
      clubName: club_name.trim(),
      requesterName: user?.full_name || "Sinh viên",
      requesterEmail: user?.email || "",
      description: reason.trim() || description || "",
      memberCount: uniqueMemberIds.length,
    }).catch((err) => console.error("Club creation SA email error:", err.message));
  } catch (err) {
    console.error("Failed to trigger SA email for club creation:", err.message);
  }

  return request;
};

module.exports = {
  getAllClubs,
  getClubById,
  requestCreateClub,
};