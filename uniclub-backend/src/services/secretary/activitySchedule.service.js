const Activity = require("../../models/activity.model");
const ClubMember = require("../../models/club_member.model");
const { getStatusError } = require("../../utils/error");

const ACTIVITY_STATUS = ["coming_soon", "opening", "closed"];

const CREATED_BY_POPULATE = {
  path: "created_by",
  select: "_id user_id role",
  populate: {
    path: "user_id",
    select: "_id full_name email avatar_url",
  },
};

const parsePositiveInt = (value, fallback) => {
  const parsed = parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const buildActivityQuery = (clubId, filters = {}) => {
  const {
    start_date: startDate,
    end_date: endDate,
    search,
    status,
  } = filters;

  const query = {
    club_id: clubId,
  };

  if (status && ACTIVITY_STATUS.includes(status)) {
    query.status = status;
  }

  if (startDate || endDate) {
    query.start_time = {};

    if (startDate) {
      query.start_time.$gte = new Date(startDate);
    }

    if (endDate) {
      query.start_time.$lte = new Date(endDate);
    }
  }

  if (search) {
    query.title = { $regex: search, $options: "i" };
  }

  return query;
};

const getClubActivitySchedule = async (clubId, filters = {}) => {
  const page = parsePositiveInt(filters.page, 1);
  const limit = parsePositiveInt(filters.limit, 10);
  const query = buildActivityQuery(clubId, filters);

  const [activities, total] = await Promise.all([
    Activity.find(query)
      .populate(CREATED_BY_POPULATE)
      .sort({ start_time: 1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .select(
        "_id club_id created_by title description location start_time end_time status created_at updated_at createdAt updatedAt"
      ),
    Activity.countDocuments(query),
  ]);

  return {
    activities,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 0,
    },
  };
};

const getActivityScheduleDetail = async (clubId, activityId) => {
  const activity = await Activity.findOne({
    _id: activityId,
    club_id: clubId,
  })
    .populate(CREATED_BY_POPULATE)
    .populate("club_id", "_id name logo_url")
    .select(
      "_id club_id created_by title description location start_time end_time status created_at updated_at createdAt updatedAt"
    );

  if (!activity) {
    throw getStatusError("Activity not found", 404);
  }

  return activity;
};

const createActivity = async (clubId, userId, payload) => {
  const {
    title,
    description,
    location,
    start_time: startTime,
    end_time: endTime,
    status = "coming_soon",
  } = payload;

  if (new Date(startTime) >= new Date(endTime)) {
    throw getStatusError("end_time must be after start_time", 400);
  }

  if (!ACTIVITY_STATUS.includes(status)) {
    throw getStatusError("Invalid status", 400);
  }

  const clubMember = await ClubMember.findOne({
    club_id: clubId,
    user_id: userId,
    status: "active",
  });

  const createdBy = clubMember ? clubMember._id : userId;

  const activity = await Activity.create({
    club_id: clubId,
    created_by: createdBy,
    title: title.trim(),
    description: description.trim(),
    location: location.trim(),
    start_time: new Date(startTime),
    end_time: new Date(endTime),
    status,
  });

  return Activity.findById(activity._id)
    .populate(CREATED_BY_POPULATE)
    .populate("club_id", "_id name logo_url")
    .select(
      "_id club_id created_by title description location start_time end_time status created_at updated_at createdAt updatedAt"
    );
};

const updateActivity = async (clubId, activityId, payload) => {
  const activity = await Activity.findOne({
    _id: activityId,
    club_id: clubId,
  });

  if (!activity) {
    throw getStatusError("Activity not found", 404);
  }

  const {
    title,
    description,
    location,
    start_time: startTime,
    end_time: endTime,
    status,
  } = payload;

  if (title !== undefined) {
    activity.title = title.trim();
  }

  if (description !== undefined) {
    activity.description = description.trim();
  }

  if (location !== undefined) {
    activity.location = location.trim();
  }

  if (startTime !== undefined) {
    if (Number.isNaN(new Date(startTime).getTime())) {
      throw getStatusError("Invalid start_time", 400);
    }
    activity.start_time = new Date(startTime);
  }

  if (endTime !== undefined) {
    if (Number.isNaN(new Date(endTime).getTime())) {
      throw getStatusError("Invalid end_time", 400);
    }
    activity.end_time = new Date(endTime);
  }

  if (activity.start_time >= activity.end_time) {
    throw getStatusError("end_time must be after start_time", 400);
  }

  if (status !== undefined) {
    if (!ACTIVITY_STATUS.includes(status)) {
      throw getStatusError("Invalid status", 400);
    }
    activity.status = status;
  }

  await activity.save();

  return Activity.findById(activity._id)
    .populate(CREATED_BY_POPULATE)
    .populate("club_id", "_id name logo_url")
    .select(
      "_id club_id created_by title description location start_time end_time status created_at updated_at createdAt updatedAt"
    );
};

const deleteActivity = async (clubId, activityId) => {
  const activity = await Activity.findOneAndDelete({
    _id: activityId,
    club_id: clubId,
  });

  if (!activity) {
    throw getStatusError("Activity not found", 404);
  }

  return activity;
};

const ActivityAttendance = require("../../models/activity_attendance.model");
const { awardRewardPoints } = require("../pointsAward.helper");

const getActivityAttendance = async (clubId, activityId) => {
  const activity = await Activity.findOne({ _id: activityId, club_id: clubId });
  if (!activity) {
    throw getStatusError("Activity not found", 404);
  }

  const attendances = await ActivityAttendance.find({
    activity_id: activityId,
    club_id: clubId,
  }).lean();

  const members = await ClubMember.find({ club_id: clubId, status: "active" })
    .populate("user_id", "_id full_name email avatar_url")
    .lean();

  const attendanceMap = new Map();
  attendances.forEach((att) => {
    const mid = String(att.membership_id?._id || att.membership_id);
    attendanceMap.set(mid, att);
  });

  const memberList = members.map((m) => {
    const memberId = String(m._id);
    const userId = String(m.user_id?._id || m.user_id);
    const existing = attendanceMap.get(memberId);
    return {
      id: userId,
      membershipId: m._id,
      name: m.user_id?.full_name || "Thành viên",
      email: m.user_id?.email || "",
      avatarUrl: m.user_id?.avatar_url || "",
      checked: existing ? existing.status === "attended" : false,
      status: existing ? existing.status : "pending",
      checkInTime: existing ? existing.check_in_time : null,
    };
  });

  return {
    activityId,
    clubId,
    members: memberList,
  };
};

const saveActivityAttendance = async (clubId, activityId, memberAttendanceList, adminUserId) => {
  const activity = await Activity.findOne({ _id: activityId, club_id: clubId });
  if (!activity) {
    throw getStatusError("Activity not found", 404);
  }

  const adminMember = await ClubMember.findOne({
    club_id: clubId,
    user_id: adminUserId,
    status: "active",
  });
  const checkedBy = adminMember ? adminMember._id : null;

  let awardedCount = 0;

  for (const item of memberAttendanceList) {
    const { userId, membershipId, checked } = item;
    if (!userId && !membershipId) continue;

    let member = null;
    if (membershipId) {
      member = await ClubMember.findOne({ _id: membershipId, club_id: clubId, status: "active" });
    } else if (userId) {
      member = await ClubMember.findOne({ user_id: userId, club_id: clubId, status: "active" });
    }
    if (!member) continue;

    const actualUserId = String(member.user_id);
    const status = checked ? "attended" : "absent";

    await ActivityAttendance.findOneAndUpdate(
      { activity_id: activityId, membership_id: member._id },
      {
        club_id: clubId,
        membership_id: member._id,
        status,
        check_in_time: checked ? new Date() : null,
        checked_by: checkedBy,
      },
      { upsert: true, new: true }
    );

    if (checked) {
      const awardRes = await awardRewardPoints({
        clubId,
        userId: actualUserId,
        actionTypeCode: "meeting",
        eventId: activityId,
        presidentId: adminUserId,
      });

      if (!awardRes) {
        await awardRewardPoints({
          clubId,
          userId: actualUserId,
          actionTypeCode: "attendance",
          eventId: activityId,
          presidentId: adminUserId,
        });
      }

      awardedCount += 1;
    }
  }

  return {
    success: true,
    activityId,
    awardedCount,
    totalProcessed: memberAttendanceList.length,
  };
};

module.exports = {
  getClubActivitySchedule,
  getActivityScheduleDetail,
  createActivity,
  updateActivity,
  deleteActivity,
  getActivityAttendance,
  saveActivityAttendance,
};
