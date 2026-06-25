const mongoose = require("mongoose");
const ClubMember = require("../models/clubMember.model");

//check club hợp lệ hay không, nếu không hợp lệ thì trả về lỗi 400
const validateObjectId = (id, message) => {
  if (!id || !mongoose.isValidObjectId(id)) {
    const error = new Error(message);
    error.statusCode = 400;
    throw error;
  }
};

const escapeRegex = (value = "") => {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

// UC 24 - View Club Members(Member Management)
// endpoint: GET /api/club-members/:clubId/members/manage?search=&status=all&sortBy=joined_at&sortOrder=desc
// president có quyền search theo full_name hoặc student_code
// president có quyền filter theo status: all, active, left, removed
// president có quyền sort theo full_name, student_code, role, status, joined_at, left_at
const getClubMembersForManagement = async ({
  clubId,
  currentUserId,
  search = "",
  status = "all",
  sortBy = "joined_at",
  sortOrder = "desc",
}) => {
  validateObjectId(clubId, "Invalid club ID");
  validateObjectId(currentUserId, "Invalid user ID");

  const allowedStatuses = ["all", "active", "left", "removed"];

  //check nếu FE gửi status không hợp lệ
  if (!allowedStatuses.includes(status)) {
    const error = new Error("Invalid member status");
    error.statusCode = 400;
    throw error;
  }

  const sortFields = {
    full_name: "user.full_name",
    student_code: "profile.student_code",
    role: "role",
    status: "status",
    joined_at: "joined_at",
    left_at: "left_at",
  };

  const sortField = sortFields[sortBy] || "joined_at";
  const sortDirection = sortOrder === "asc" ? 1 : -1;

  const clubObjectId = new mongoose.Types.ObjectId(clubId);
  const currentUserObjectId = new mongoose.Types.ObjectId(currentUserId);

  const matchStage = {
    club_id: clubObjectId,
  };

  if (status !== "all") {
    matchStage.status = status;
  }

  const pipeline = [
    {
      $match: matchStage,
    },

    {
      $lookup: {
        from: "users",
        localField: "user_id",
        foreignField: "_id",
        as: "user",
      },
    },

    {
      $unwind: "$user",
    },

    {
      $lookup: {
        from: "profiles",
        localField: "user_id",
        foreignField: "user_id",
        as: "profile",
      },
    },

    {
      $unwind: {
        path: "$profile",
        preserveNullAndEmptyArrays: true,
      },
    },
  ];

  const keyword = search.trim();

  if (keyword) {
    const regex = new RegExp(escapeRegex(keyword), "i");

    pipeline.push({
      $match: {
        $or: [{ "user.full_name": regex }, { "profile.student_code": regex }],
      },
    });
  }

  pipeline.push(
    {
      $sort: {
        [sortField]: sortDirection,
        joined_at: -1,
      },
    },
    {
      $project: {
        _id: 0,
        member_id: "$_id",
        user_id: "$user._id",
        full_name: "$user.full_name",
        email: "$user.email",
        avatar_url: "$user.avatar_url",
        user_status: "$user.status",

        student_code: "$profile.student_code",
        phone: "$profile.phone",
        major: "$profile.major",
        campus: "$profile.campus",

        role: "$role",
        status: "$status",
        joined_at: "$joined_at",
        left_at: "$left_at",

        can_remove: {
          $and: [
            { $eq: ["$status", "active"] },
            { $ne: ["$role", "president"] },
            { $ne: ["$user._id", currentUserObjectId] },
          ],
        },
      },
    },
  );

  const members = await ClubMember.aggregate(pipeline);

  return {
    filters: {
      search: keyword,
      status,
      sortBy,
      sortOrder: sortDirection === 1 ? "asc" : "desc",
    },
    total: members.length,
    members,
  };
};

// UC 25 - Remove Club Member (Member Management)
// endpoint: PATCH /api/club-members/:clubId/members/:memberId/remove

const removeMember = async ({ clubId, memberId, currentUserId }) => {
  validateObjectId(clubId, "Invalid club ID");
  validateObjectId(memberId, "Invalid member ID");

  const targetMember = await ClubMember.findOne({
    _id: memberId,
    club_id: clubId,
  });

  if (!targetMember) {
    const error = new Error("Member not found in this club");
    error.statusCode = 404;
    throw error;
  }

  if (targetMember.status !== "active") {
    const error = new Error("Member is not active");
    error.statusCode = 400;
    throw error;
  }

  if (String(targetMember.user_id) === String(currentUserId)) {
    const error = new Error("You cannot remove yourself");
    error.statusCode = 400;
    throw error;
  }

  if (targetMember.role === "president") {
    const error = new Error("Club president cannot be removed");
    error.statusCode = 400;
    throw error;
  }

  targetMember.status = "removed";
  targetMember.left_at = new Date();

  await targetMember.save();

  await targetMember.populate("user_id", "full_name email avatar_url");

  return {
    member_id: targetMember._id,
    user_id: targetMember.user_id?._id,
    full_name: targetMember.user_id?.full_name,
    email: targetMember.user_id?.email,
    avatar_url: targetMember.user_id?.avatar_url,
    role: targetMember.role,
    status: targetMember.status,
    left_at: targetMember.left_at,
  };
};

module.exports = {
  getClubMembersForManagement,
  removeMember,
};
