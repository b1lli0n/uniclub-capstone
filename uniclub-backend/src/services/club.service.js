const mongoose = require("mongoose");
const Club = require("../models/club.model");
const ClubMember = require("../models/club_member.model");
const Profile = require("../models/profile.model");
const ClubCreationRequest = require("../models/club_creation_requests.model");

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const buildClubSearchFilter = ({ search, category }) => {
  const filter = {};

  if (search && search.trim()) {
    const keyword = search.trim();

    filter.$or = [
      { name: { $regex: keyword, $options: "i" } },
      { description: { $regex: keyword, $options: "i" } },
      { category: { $regex: keyword, $options: "i" } },
    ];
  }

  if (category && category.trim()) {
    filter.category = { $regex: `^${category.trim()}$`, $options: "i" };
  }

  return filter;
};

// UC - 16 View Club List
// Endpoint: GET /api/club-management?search=&category=&status=&page=&limit=&sortBy=
const getClubList = async ({ query, currentUser }) => {
  const {
    page = 1,
    limit = 10,
    search,
    category,
    status,
    sortBy = "newest",
  } = query;

  const pageNumber = Math.max(Number(page), 1);
  const limitNumber = Math.max(Number(limit), 1);
  const skip = (pageNumber - 1) * limitNumber;

  const filter = buildClubSearchFilter({ search, category });

  if (currentUser.role === "student") {
    filter.status = "active";
  }

  if (currentUser.role === "student_affairs") {
    if (status) {
      if (!["active", "inactive"].includes(status)) {
        const error = new Error("Invalid club status");
        error.statusCode = 400;
        throw error;
      }

      filter.status = status;
    }
  }

  let sortOption = { created_at: -1 };

  if (sortBy === "name_asc") {
    sortOption = { name: 1 };
  }

  if (sortBy === "name_desc") {
    sortOption = { name: -1 };
  }

  const [clubs, total] = await Promise.all([
    Club.find(filter)
      .populate("created_by", "full_name email avatar_url")
      .sort(sortOption)
      .skip(skip)
      .limit(limitNumber)
      .lean(),
    Club.countDocuments(filter),
  ]);

  return {
    clubs,
    pagination: {
      page: pageNumber,
      limit: limitNumber,
      total,
      total_pages: Math.ceil(total / limitNumber),
    },
  };
};

// UC - 17 View Club Details
// Endpoint: GET /api/club-management/:clubId
const getClubDetail = async ({ clubId, currentUser }) => {
  if (!isValidObjectId(clubId)) {
    const error = new Error("Invalid club ID");
    error.statusCode = 400;
    throw error;
  }

  const club = await Club.findById(clubId)
    .populate("created_by", "full_name email avatar_url")
    .lean();

  if (!club) {
    const error = new Error("Club not found");
    error.statusCode = 404;
    throw error;
  }

  if (currentUser.role === "student" && club.status !== "active") {
    const error = new Error("Club not found");
    error.statusCode = 404;
    throw error;
  }

  const memberCount = await ClubMember.countDocuments({
    club_id: clubId,
    status: "active",
  });

  return {
    ...club,
    member_count: memberCount,
  };
};

// UC - 18 View Club Members
// Endpoint: GET /api/club-management/:clubId/members?role=&status=&search=&page=&limit=
const getClubMembers = async ({ clubId, query }) => {
  if (!isValidObjectId(clubId)) {
    const error = new Error("Invalid club ID");
    error.statusCode = 400;
    throw error;
  }

  const club = await Club.findById(clubId).lean();

  if (!club) {
    const error = new Error("Club not found");
    error.statusCode = 404;
    throw error;
  }

  const {
    role,
    status,
    search,
    page = 1,
    limit = 10,
  } = query;

  const pageNumber = Math.max(Number(page), 1);
  const limitNumber = Math.max(Number(limit), 1);
  const skip = (pageNumber - 1) * limitNumber;

  const filter = {
    club_id: clubId,
  };

  if (role) {
    const allowedRoles = [
      "member",
      "president",
      "secretary",
      "treasurer",
      "event_manager",
    ];

    if (!allowedRoles.includes(role)) {
      const error = new Error("Invalid member role");
      error.statusCode = 400;
      throw error;
    }

    filter.role = role;
  }

  if (status) {
    const allowedStatuses = ["active", "left", "removed"];

    if (!allowedStatuses.includes(status)) {
      const error = new Error("Invalid member status");
      error.statusCode = 400;
      throw error;
    }

    filter.status = status;
  }

  let members = await ClubMember.find(filter)
    .populate("user_id", "full_name email avatar_url status")
    .sort({ joined_at: -1 })
    .lean();

  if (search && search.trim()) {
    const keyword = search.trim().toLowerCase();

    members = members.filter((member) => {
      const fullName = member.user_id?.full_name?.toLowerCase() || "";
      const email = member.user_id?.email?.toLowerCase() || "";
      return fullName.includes(keyword) || email.includes(keyword);
    });
  }

  const total = members.length;
  const paginatedMembers = members.slice(skip, skip + limitNumber);

  const userIds = paginatedMembers
    .map((member) => member.user_id?._id)
    .filter(Boolean);

  const profiles = await Profile.find({
    user_id: { $in: userIds },
  }).lean();

  const profileMap = new Map(
    profiles.map((profile) => [profile.user_id.toString(), profile])
  );

  const formattedMembers = paginatedMembers.map((member) => ({
    _id: member._id,
    role: member.role,
    status: member.status,
    joined_at: member.joined_at,
    left_at: member.left_at,
    user: member.user_id
      ? {
          _id: member.user_id._id,
          full_name: member.user_id.full_name,
          email: member.user_id.email,
          avatar_url: member.user_id.avatar_url,
          status: member.user_id.status,
          profile: profileMap.get(member.user_id._id.toString()) || null,
        }
      : null,
  }));

  return {
    club: {
      _id: club._id,
      name: club.name,
      status: club.status,
    },
    members: formattedMembers,
    pagination: {
      page: pageNumber,
      limit: limitNumber,
      total,
      total_pages: Math.ceil(total / limitNumber),
    },
  };
};

// UC - 19 Assign Management Roles
// Endpoint: PATCH /api/club-management/:clubId/members/:memberId/role
const assignManagementRole = async ({ clubId, memberId, role }) => {
  if (!isValidObjectId(clubId)) {
    const error = new Error("Invalid club ID");
    error.statusCode = 400;
    throw error;
  }

  if (!isValidObjectId(memberId)) {
    const error = new Error("Invalid member ID");
    error.statusCode = 400;
    throw error;
  }

  const allowedRoles = [
    "member",
    "president",
    "secretary",
    "treasurer",
    "event_manager",
  ];

  if (!role || !allowedRoles.includes(role)) {
    const error = new Error("Invalid member role");
    error.statusCode = 400;
    throw error;
  }

  const club = await Club.findById(clubId).lean();

  if (!club) {
    const error = new Error("Club not found");
    error.statusCode = 404;
    throw error;
  }

  const member = await ClubMember.findOne({
    _id: memberId,
    club_id: clubId,
  }).populate("user_id", "full_name email avatar_url");

  if (!member) {
    const error = new Error("Club member not found");
    error.statusCode = 404;
    throw error;
  }
  
  //Chỉ set role cho member có status là "active"
  if (member.status !== "active") {
    const error = new Error("Only active members can be assigned roles");
    error.statusCode = 400;
    throw error;
  }

  //Nếu role được set là "president", thì đảm bảo president hiện tại sẽ bị hạ xuống "member"
  if (role === "president") {
    await ClubMember.updateMany(
      {
        club_id: clubId,
        role: "president",
        _id: { $ne: memberId },
      },
      {
        $set: { role: "member" },
      }
    );
  }

  member.role = role;
  await member.save();

  return {
    _id: member._id,
    club_id: member.club_id,
    role: member.role,
    status: member.status,
    joined_at: member.joined_at,
    left_at: member.left_at,
    user: member.user_id
      ? {
          _id: member.user_id._id,
          full_name: member.user_id.full_name,
          email: member.user_id.email,
          avatar_url: member.user_id.avatar_url,
        }
      : null,
  };
};

// UC - 20 Activate/Deactivate Club
// Endpoint: PATCH /api/club-management/:clubId/status
const updateClubStatus = async ({ clubId, status }) => {
  if (!isValidObjectId(clubId)) {
    const error = new Error("Invalid club ID");
    error.statusCode = 400;
    throw error;
  }

  if (!status || !["active", "inactive"].includes(status)) {
    const error = new Error("Invalid club status");
    error.statusCode = 400;
    throw error;
  }

  const club = await Club.findById(clubId)
    .populate("created_by", "full_name email avatar_url")
    .lean();

  if (!club) {
    const error = new Error("Club not found");
    error.statusCode = 404;
    throw error;
  }

  if (club.status === status) {
    return club;
  }

  const updatedClub = await Club.findByIdAndUpdate(
    clubId,
    { status },
    { new: true }
  )
    .populate("created_by", "full_name email avatar_url")
    .lean();

  return updatedClub;
};

// UC-13 View Club Creation Request List
const getClubCreationRequestList = async ({ query }) => {
  const {
    page = 1,
    limit = 10,
    search,
    status,
    sortBy = "newest",
  } = query;

  const pageNumber = Math.max(Number(page), 1);
  const limitNumber = Math.max(Number(limit), 1);
  const skip = (pageNumber - 1) * limitNumber;

  const filter = {};

  // Search
  if (search?.trim()) {
    filter.$or = [
      {
        club_name: {
          $regex: search.trim(),
          $options: "i",
        },
      },
      {
        reason: {
          $regex: search.trim(),
          $options: "i",
        },
      },
    ];
  }

  // Filter
  if (status) {
    if (!["pending", "approved", "rejected"].includes(status)) {
      const error = new Error("Invalid request status");
      error.statusCode = 400;
      throw error;
    }

    filter.status = status;
  }

  // Sort
  let sortOption = { created_at: -1 };

  if (sortBy === "oldest") {
    sortOption = { created_at: 1 };
  }

  if (sortBy === "club_name_asc") {
    sortOption = { club_name: 1 };
  }

  if (sortBy === "club_name_desc") {
    sortOption = { club_name: -1 };
  }

  const [requests, total] = await Promise.all([
    ClubCreationRequest.find(filter)
      .populate("requested_by", "full_name email")
      .populate("reviewed_by", "full_name email")
      .sort(sortOption)
      .skip(skip)
      .limit(limitNumber)
      .lean(),

    ClubCreationRequest.countDocuments(filter),
  ]);

  return {
    requests,
    pagination: {
      page: pageNumber,
      limit: limitNumber,
      total,
      total_pages: Math.ceil(total / limitNumber),
    },
  };
};

// UC-14 View Club Creation Request Detail
const getClubCreationRequestDetail = async ({ requestId }) => {
  const request = await ClubCreationRequest.findById(requestId)
    .populate(
      "requested_by",
      "full_name email avatar_url student_code"
    )
    .populate(
      "member_ids",
      "full_name email avatar_url student_code"
    )
    .populate(
      "reviewed_by",
      "full_name email"
    )
    .lean();

  if (!request) {
    const error = new Error("Club creation request not found");
    error.statusCode = 404;
    throw error;
  }

  return request;
};

// UC-15 Approve / Reject Club Creation Request
const reviewClubCreationRequest = async ({
  requestId,
  status,
  reviewNote,
  reviewerId,
}) => {
  if (!["approved", "rejected"].includes(status)) {
    const error = new Error(
      "Status must be approved or rejected"
    );
    error.statusCode = 400;
    throw error;
  }

  const request =
    await ClubCreationRequest.findById(requestId);

  if (!request) {
    const error = new Error(
      "Club creation request not found"
    );
    error.statusCode = 404;
    throw error;
  }

  request.status = status;
  if (reviewNote) request.review_note = reviewNote;
  if (reviewerId) request.reviewed_by = reviewerId;
  request.reviewed_at = new Date();

  await request.save();

  // If approved, create active Club document & ClubMember records for President and members!
  if (status === "approved") {
    try {
      const clubNameRegex = { $regex: `^${request.club_name.trim()}$`, $options: "i" };
      let newClub = await Club.findOne({ name: clubNameRegex });

      if (!newClub) {
        newClub = await Club.create({
          name: request.club_name.trim(),
          description: request.description || request.reason || "",
          category: request.category || "Arts",
          logo_url: request.logo_url || "https://placehold.co/200x200/png",
          created_by: request.requested_by,
          status: "active",
        });
      }

      // Add requester as President/Leader in ClubMember
      await ClubMember.findOneAndUpdate(
        { club_id: newClub._id, user_id: request.requested_by },
        { role: "president", status: "active", joined_at: new Date() },
        { upsert: true, new: true }
      );

      // Add initial members in ClubMember
      if (Array.isArray(request.member_ids)) {
        for (const memberId of request.member_ids) {
          if (String(memberId) !== String(request.requested_by)) {
            await ClubMember.findOneAndUpdate(
              { club_id: newClub._id, user_id: memberId },
              { role: "member", status: "active", joined_at: new Date() },
              { upsert: true, new: true }
            );
          }
        }
      }
    } catch (err) {
      console.error("Error creating active club upon approval:", err.message);
    }
  }

  // Send Email Notification to Requester Student
  try {
    const User = require("../models/user.model");
    const {
      sendClubCreationApprovedEmailToStudent,
      sendClubCreationRejectedEmailToStudent,
    } = require("./email.service");

    const requester = await User.findById(request.requested_by);
    if (requester?.email) {
      if (status === "approved") {
        sendClubCreationApprovedEmailToStudent({
          toEmail: requester.email,
          requesterName: requester.full_name || "Sinh viên",
          clubName: request.club_name,
          reviewNote: reviewNote || "",
        }).catch((err) => console.error("Club creation approved email error:", err.message));
      } else if (status === "rejected") {
        sendClubCreationRejectedEmailToStudent({
          toEmail: requester.email,
          requesterName: requester.full_name || "Sinh viên",
          clubName: request.club_name,
          reviewNote: reviewNote || "",
        }).catch((err) => console.error("Club creation rejected email error:", err.message));
      }
    }
  } catch (err) {
    console.error("Failed to trigger review email for club creation:", err.message);
  }

  return request;
};

module.exports = {
  getClubList,
  getClubDetail,
  getClubMembers,
  assignManagementRole,
  updateClubStatus,
  getClubCreationRequestList,
  getClubCreationRequestDetail,
  reviewClubCreationRequest,
};