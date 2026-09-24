const mongoose = require("mongoose");
const Club = require("../models/club.model");
const ClubMember = require("../models/club_member.model");
const Event = require("../models/event.model");
const ClubCreationRequest = require("../models/club_creation_requests.model");
const User = require("../models/user.model");

const buildClubQuery = ({ category, search }) => {
  const filter = { status: "active" };

  if (category && category !== "all") {
    const cleanCat = category.toLowerCase().trim().replace(/s$/, "");
    filter.category = { $regex: new RegExp(`^${cleanCat}s?$`, "i") };
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

  const clubs = await Club.find(filter)
    .populate("president_id", "full_name email avatar_url student_code")
    .sort(sortOptions)
    .lean();

  if (!clubs || clubs.length === 0) {
    return [];
  }

  const clubIds = clubs.map((c) => c._id);

  const [memberCounts, eventCounts, presidentMembers] = await Promise.all([
    ClubMember.aggregate([
      { $match: { club_id: { $in: clubIds }, status: "active" } },
      { $group: { _id: "$club_id", count: { $sum: 1 } } },
    ]),
    Event.aggregate([
      { $match: { club_id: { $in: clubIds } } },
      { $group: { _id: "$club_id", count: { $sum: 1 } } },
    ]),
    ClubMember.find({
      club_id: { $in: clubIds },
      role: { $in: ["president", "leader"] },
      status: "active",
    })
      .populate("user_id", "full_name email avatar_url student_code")
      .lean(),
  ]);

  const memberCountMap = new Map(
    memberCounts.map((item) => [String(item._id), item.count])
  );
  const eventCountMap = new Map(
    eventCounts.map((item) => [String(item._id), item.count])
  );
  const presidentMap = new Map();
  for (const pm of presidentMembers) {
    if (pm.user_id && !presidentMap.has(String(pm.club_id))) {
      presidentMap.set(String(pm.club_id), pm.user_id);
    }
  }

  return clubs.map((club) => {
    const leaderUser = club.president_id || presidentMap.get(String(club._id)) || null;
    const mCount = memberCountMap.get(String(club._id)) || 0;
    const eCount = eventCountMap.get(String(club._id)) || 0;

    return {
      ...club,
      president_id: leaderUser,
      leader: leaderUser ? leaderUser.full_name : "Unknown",
      member_count: mCount,
      event_count: eCount,
      members_count: mCount,
      events_count: eCount,
      members: mCount,
      events: eCount,
    };
  });
};


// UC - View Details of a Club
const getClubById = async (id) => {
  if (!mongoose.isValidObjectId(id)) {
    const error = new Error("Invalid club ID");
    error.statusCode = 400;
    throw error;
  }

  let club = await Club.findOne({ _id: id, status: "active" })
    .populate("president_id", "full_name email avatar_url student_code")
    .lean();

  if (!club) {
    club = await Club.findById(id)
      .populate("president_id", "full_name email avatar_url student_code")
      .lean();
  }

  if (!club) {
    const error = new Error("Club not found");
    error.statusCode = 404;
    throw error;
  }

  let leaderUser = club.president_id;
  if (!leaderUser) {
    const presidentMember = await ClubMember.findOne({
      club_id: id,
      role: { $in: ["president", "leader"] },
      status: "active",
    })
      .populate("user_id", "full_name email avatar_url student_code")
      .lean();

    if (presidentMember?.user_id) {
      leaderUser = presidentMember.user_id;
    }
  }

  const [memberCount, eventCount] = await Promise.all([
    ClubMember.countDocuments({ club_id: id, status: "active" }),
    Event.countDocuments({ club_id: id }),
  ]);

  return {
    ...club,
    president_id: leaderUser,
    leader: leaderUser ? leaderUser.full_name : "Unknown",
    member_count: memberCount,
    event_count: eventCount,
    members_count: memberCount,
    events_count: eventCount,
    members: memberCount,
    events: eventCount,
  };
};

const normalizeCategory = (cat) => {
  if (!cat) return "Academic";
  const c = String(cat).toLowerCase().trim();
  if (c === "academic") return "Academic";
  if (c === "sport" || c === "sports") return "Sports";
  if (c === "art" || c === "arts") return "Arts";
  if (c === "event" || c === "events") return "Event";
  return "Other";
};

// UC - Request to Create a New Club
const requestCreateClub = async ({
  club_name,
  slogan,
  category,
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
    status: { $in: ["waiting_member_approval", "pending"] },
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

  const invitedUsers = await User.find({ _id: { $in: uniqueMemberIds } });
  const userEmailMap = {};
  invitedUsers.forEach((u) => {
    userEmailMap[String(u._id)] = u.email || "";
  });

  const isMockEmail = (email) => {
    if (!email || typeof email !== "string") return false;
    const e = email.toLowerCase().trim();
    return e.endsWith("@uniclub.local") || e.endsWith("@example.com") || e.endsWith("@test.local");
  };

  const membersList = uniqueMemberIds.map((id) => {
    const email = (userEmailMap[String(id)] || "").toLowerCase();
    const isMock = isMockEmail(email);
    return {
      user_id: id,
      status: isMock ? "accepted" : "pending",
      responded_at: isMock ? new Date() : null,
    };
  });

  const allAccepted = membersList.every((m) => m.status === "accepted");
  const initialStatus = allAccepted ? "pending" : "waiting_member_approval";

  const expiresAt = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);

  const request = await ClubCreationRequest.create({
    club_name: club_name.trim(),
    slogan: slogan ? slogan.trim() : "",
    category: normalizeCategory(category),
    description: description || "",
    reason: (reason ? reason.trim() : (description || club_name || "")),
    logo_url: logo_url.trim(),
    requested_by,
    members: membersList,
    member_ids: uniqueMemberIds,
    status: initialStatus,
    expires_at: expiresAt,
    reviewed_by: null,
    review_note: null,
    reviewed_at: null,
  });

  // Trigger Confirmation Email to Requester & Invitation Emails to non-demo founding members
  try {
    const {
      sendClubCreationMemberInviteEmail,
      sendClubCreationSubmittedEmailToRequester,
    } = require("./email.service");
    const requester = await User.findById(requested_by);

    // 1. Send confirmation receipt email to Requester
    if (requester?.email && !isMockEmail(requester.email)) {
      try {
        await sendClubCreationSubmittedEmailToRequester({
          toEmail: requester.email.trim(),
          requesterName: requester.full_name || "Student",
          clubName: club_name.trim(),
          memberCount: uniqueMemberIds.length,
          expiresAt,
        });
      } catch (err) {
        console.error(`Error sending submission receipt to requester ${requester.email}:`, err.message);
      }
    }

    // 2. Send invitation emails to real (non-mock) founding members
    const safeDescription = (reason ? reason.trim() : "") || description || "";
    for (const member of invitedUsers) {
      if (
        member?.email &&
        !isMockEmail(member.email) &&
        String(member._id) !== String(requested_by)
      ) {
        try {
          await sendClubCreationMemberInviteEmail({
            toEmail: member.email.trim(),
            memberName: member.full_name || "Student",
            requesterName: requester?.full_name || "Founding Student",
            clubName: club_name.trim(),
            description: safeDescription,
          });
        } catch (err) {
          console.error(`Error sending invite to ${member.email}:`, err.message);
        }
      }
    }
  } catch (err) {
    console.error("Failed to trigger member invitation emails:", err.message);
  }

  return request;
};

const getMyClubCreationRequests = async (userId) => {
  const requests = await ClubCreationRequest.find({ requested_by: userId })
    .populate("members.user_id", "full_name email avatar_url student_code")
    .populate("reviewed_by", "full_name email")
    .sort({ created_at: -1 })
    .lean();

  return requests;
};

module.exports = {
  getAllClubs,
  getClubById,
  requestCreateClub,
  getMyClubCreationRequests,
};