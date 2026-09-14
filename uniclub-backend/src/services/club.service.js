const mongoose = require("mongoose");
const User = require("../models/user.model");
const Club = require("../models/club.model");
const ClubMember = require("../models/club_member.model");
const Event = require("../models/event.model");
const Profile = require("../models/profile.model");
const ClubCreationRequest = require("../models/club_creation_requests.model");
const JoinForm = require("../models/join_form.model");

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
      .populate("president_id", "full_name email avatar_url student_code")
      .sort(sortOption)
      .skip(skip)
      .limit(limitNumber)
      .lean(),
    Club.countDocuments(filter),
  ]);

  let clubsWithCounts = clubs;
  if (clubs.length > 0) {
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

    clubsWithCounts = clubs.map((club) => {
      const leaderUser = club.president_id || presidentMap.get(String(club._id)) || null;

      if (!club.president_id && leaderUser?._id) {
        Club.updateOne({ _id: club._id }, { president_id: leaderUser._id }).catch(() => {});
      }

      return {
        ...club,
        president_id: leaderUser,
        leader: leaderUser ? leaderUser.full_name : "Unknown",
        member_count: memberCountMap.get(String(club._id)) || 0,
        event_count: eventCountMap.get(String(club._id)) || 0,
      };
    });
  }

  return {
    clubs: clubsWithCounts,
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
    .populate("president_id", "full_name email avatar_url student_code")
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

  let leaderUser = club.president_id;
  if (!leaderUser) {
    const presidentMember = await ClubMember.findOne({
      club_id: clubId,
      role: { $in: ["president", "leader"] },
      status: "active",
    })
      .populate("user_id", "full_name email avatar_url student_code")
      .lean();

    if (presidentMember?.user_id) {
      leaderUser = presidentMember.user_id;
      Club.updateOne({ _id: clubId }, { president_id: leaderUser._id }).catch(() => {});
    }
  }

  const [memberCount, eventCount] = await Promise.all([
    ClubMember.countDocuments({
      club_id: clubId,
      status: "active",
    }),
    Event.countDocuments({
      club_id: clubId,
    }),
  ]);

  return {
    ...club,
    president_id: leaderUser,
    leader: leaderUser ? leaderUser.full_name : "Unknown",
    member_count: memberCount,
    event_count: eventCount,
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

  // BR-72: Không thể trực tiếp hạ Chủ tịch hiện tại xuống vai trò khác. Muốn thay đổi cần bổ nhiệm một Chủ tịch mới thay thế.
  if (member.role === "president" && role !== "president") {
    const error = new Error(
      "BR-72: Cannot demote the current President directly. Please appoint a new President to replace."
    );
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

    // Đồng bộ cập nhật president_id trong Club thành Leader ID mới nhất
    await Club.findByIdAndUpdate(clubId, {
      president_id: member.user_id?._id || member.user_id,
    });

    // Đồng bộ cập nhật created_by trong JoinForm để gắn liền với Leader mới
    await JoinForm.updateMany(
      { club_id: clubId },
      { created_by: memberId }
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
const updateClubStatus = async ({ clubId, status, reason }) => {
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

  const club = await Club.findById(clubId).lean();

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
  ).lean();

  // If club is deactivated, send email to leader
  if (status === "inactive") {
    try {
      const { sendClubDeactivatedEmailToLeader } = require("./email.service");
      let leaderEmail = null;
      let leaderName = "Club Leader";

      if (club.president_id) {
        const leaderUser = await User.findById(club.president_id).lean();
        if (leaderUser?.email) {
          leaderEmail = leaderUser.email;
          leaderName = leaderUser.full_name || leaderName;
        }
      }

      if (!leaderEmail) {
        const presMember = await ClubMember.findOne({
          club_id: clubId,
          role: { $in: ["president", "leader"] },
          status: "active",
        })
          .populate("user_id", "full_name email")
          .lean();

        if (presMember?.user_id?.email) {
          leaderEmail = presMember.user_id.email;
          leaderName = presMember.user_id.full_name || leaderName;
        }
      }

      if (leaderEmail) {
        sendClubDeactivatedEmailToLeader({
          toEmail: leaderEmail,
          leaderName,
          clubName: club.name,
          reason: reason ? String(reason).trim() : "",
        }).catch((err) =>
          console.error("Failed to send club deactivated email:", err.message)
        );
      } else {
        console.warn(`[Club Deactivation] No leader email found for club: ${club.name} (${clubId})`);
      }
    } catch (emailErr) {
      console.error("Error triggering club deactivation email:", emailErr.message);
    }
  }

  return updatedClub;
};

// UC - Update Club Information (student_affairs)
// Endpoint: PATCH /api/club-management/:clubId or PUT /api/club-management/:clubId
const updateClub = async ({ clubId, updateData }) => {
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

  const fieldsToUpdate = {};
  if (updateData.name !== undefined) {
    const trimmed = String(updateData.name).trim();
    if (!trimmed) {
      const error = new Error("Club name cannot be empty");
      error.statusCode = 400;
      throw error;
    }
    fieldsToUpdate.name = trimmed;
  }

  if (updateData.category !== undefined) {
    const allowedCategories = ["Arts", "Sports", "Academic", "Event", "Other"];
    const matchCat = allowedCategories.find(
      (c) => c.toLowerCase() === String(updateData.category).trim().toLowerCase()
    );
    if (!matchCat) {
      const error = new Error("Invalid club category");
      error.statusCode = 400;
      throw error;
    }
    fieldsToUpdate.category = matchCat;
  }

  if (updateData.description !== undefined) {
    fieldsToUpdate.description = String(updateData.description).trim();
  }

  if (updateData.slogan !== undefined) {
    fieldsToUpdate.slogan = String(updateData.slogan).trim();
  }

  if (updateData.logo_url !== undefined) {
    fieldsToUpdate.logo_url = String(updateData.logo_url).trim();
  }

  if (updateData.status !== undefined) {
    if (!["active", "inactive"].includes(updateData.status)) {
      const error = new Error("Invalid club status");
      error.statusCode = 400;
      throw error;
    }
    fieldsToUpdate.status = updateData.status;
  }

  const updatedClub = await Club.findByIdAndUpdate(
    clubId,
    { $set: fieldsToUpdate },
    { new: true }
  )
    .populate("president_id", "full_name email avatar_url student_code")
    .lean();

  let leaderUser = updatedClub.president_id;
  if (!leaderUser) {
    const presidentMember = await ClubMember.findOne({
      club_id: clubId,
      role: { $in: ["president", "leader"] },
      status: "active",
    })
      .populate("user_id", "full_name email avatar_url student_code")
      .lean();

    if (presidentMember?.user_id) {
      leaderUser = presidentMember.user_id;
      Club.updateOne({ _id: clubId }, { president_id: leaderUser._id }).catch(() => {});
    }
  }

  return {
    ...updatedClub,
    president_id: leaderUser,
    leader: leaderUser ? leaderUser.full_name : "Unknown",
  };
};

// UC-13 View Club Creation Request List
const getClubCreationRequestList = async ({ query = {} }) => {
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

  const filter = {};

  // Search by club name, category, reason, and description
  if (search?.trim()) {
    const keyword = search.trim();
    filter.$or = [
      {
        club_name: {
          $regex: keyword,
          $options: "i",
        },
      },
      {
        category: {
          $regex: keyword,
          $options: "i",
        },
      },
      {
        reason: {
          $regex: keyword,
          $options: "i",
        },
      },
      {
        description: {
          $regex: keyword,
          $options: "i",
        },
      },
    ];
  }

  // Explicit category filter if provided
  if (category?.trim() && category.toLowerCase() !== "all") {
    filter.category = { $regex: `^${category.trim()}$`, $options: "i" };
  }

  // Sort & Status Filter
  // Supports filtering by status: All, Pending, Approved, Rejected, Waiting Member Approval, Newest, Oldest
  let sortOption = { created_at: -1 };

  if (status) {
    const normalizedStatus = String(status).trim().toLowerCase();
    if (["waiting_member_approval", "pending", "approved", "rejected"].includes(normalizedStatus)) {
      filter.status = normalizedStatus;
    } else if (normalizedStatus === "oldest") {
      sortOption = { created_at: 1 };
    } else if (normalizedStatus === "newest") {
      sortOption = { created_at: -1 };
    }
    // "all" has no status filter and keeps default newest sort
  }

  // Explicit sortBy parameter
  if (sortBy === "oldest") {
    sortOption = { created_at: 1 };
  } else if (sortBy === "newest") {
    sortOption = { created_at: -1 };
  } else if (sortBy === "club_name_asc") {
    sortOption = { club_name: 1 };
  } else if (sortBy === "club_name_desc") {
    sortOption = { club_name: -1 };
  }

  const [requests, total] = await Promise.all([
    ClubCreationRequest.find(filter)
      .populate("requested_by", "full_name email")
      .populate("reviewed_by", "full_name email")
      .populate("members.user_id", "full_name email student_code")
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
      "members.user_id",
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
          slogan: request.slogan || "",
          description: request.description || request.reason || "",
          category: request.category || "Arts",
          logo_url: request.logo_url || "https://placehold.co/200x200/png",
          president_id: request.requested_by,
          status: "active",
        });
      }

      // Add requester as President/Leader in ClubMember
      const presidentMember = await ClubMember.findOneAndUpdate(
        { club_id: newClub._id, user_id: request.requested_by },
        { role: "president", status: "active", joined_at: new Date() },
        { upsert: true, new: true }
      );

      // Automatically create a Default Join Form with active status for the new club
      const existingJoinForm = await JoinForm.findOne({ club_id: newClub._id });
      if (!existingJoinForm && presidentMember) {
        await JoinForm.create({
          club_id: newClub._id,
          title: `Application Form for ${newClub.name}`,
          description: `Welcome to ${newClub.name}! Please answer the questions below for the Club Board to review your application.`,
          questions: [
            { content: "Why do you want to join this club?" },
            { content: "What skills, hobbies, or experiences can you contribute to the club's activities?" },
            { content: "How many hours per week can you dedicate to club activities?" },
          ],
          status: "active",
          created_by: presidentMember._id,
        });
      }

      // Add initial members in ClubMember (only accepted members!)
      const acceptedMemberIds = Array.isArray(request.members) && request.members.length > 0
        ? request.members.filter((m) => m.status === "accepted").map((m) => m.user_id)
        : (request.member_ids || []);

      for (const memberId of acceptedMemberIds) {
        if (String(memberId) !== String(request.requested_by)) {
          await ClubMember.findOneAndUpdate(
            { club_id: newClub._id, user_id: memberId },
            { role: "member", status: "active", joined_at: new Date() },
            { upsert: true, new: true }
          );
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
          requesterName: requester.full_name || "Student",
          clubName: request.club_name,
          reviewNote: reviewNote || "",
        }).catch((err) => console.error("Club creation approved email error:", err.message));
      } else if (status === "rejected") {
        sendClubCreationRejectedEmailToStudent({
          toEmail: requester.email,
          requesterName: requester.full_name || "Student",
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
  updateClub,
  getClubCreationRequestList,
  getClubCreationRequestDetail,
  reviewClubCreationRequest,
};