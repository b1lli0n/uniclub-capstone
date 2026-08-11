const Activity = require("../../models/activity.model");
const { getStatusError } = require("../../utils/error");

const ACTIVITY_STATUS = ["coming_soon", "opening", "closed", "cancelled"];
const PROGRESS_STATUS = ["draft", "published"];

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
    progress_status: progressStatus,
  } = filters;

  const query = {
    club_id: clubId,
  };

  if (status && ACTIVITY_STATUS.includes(status)) {
    query.status = status;
  }

  if (progressStatus && PROGRESS_STATUS.includes(progressStatus)) {
    query.progress_status = progressStatus;
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
      .populate("created_by", "_id full_name avatar_url")
      .sort({ start_time: 1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .select(
        "_id club_id created_by title description location start_time end_time status progress_status media_urls createdAt updatedAt"
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
    .populate("created_by", "_id full_name email avatar_url")
    .populate("club_id", "_id name logo_url")
    .select(
      "_id club_id created_by title description location start_time end_time status progress_status media_urls createdAt updatedAt"
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
    progress_status: progressStatus = "draft",
    media_urls: mediaUrls = [],
  } = payload;

  if (new Date(startTime) >= new Date(endTime)) {
    throw getStatusError("end_time must be after start_time", 400);
  }

  if (!ACTIVITY_STATUS.includes(status)) {
    throw getStatusError("Invalid status", 400);
  }

  if (!PROGRESS_STATUS.includes(progressStatus)) {
    throw getStatusError("Invalid progress_status", 400);
  }

  const activity = await Activity.create({
    club_id: clubId,
    created_by: userId,
    title: title.trim(),
    description: description.trim(),
    location: location.trim(),
    start_time: new Date(startTime),
    end_time: new Date(endTime),
    status,
    progress_status: progressStatus,
    media_urls: mediaUrls,
  });

  return Activity.findById(activity._id)
    .populate("created_by", "_id full_name email avatar_url")
    .populate("club_id", "_id name logo_url")
    .select(
      "_id club_id created_by title description location start_time end_time status progress_status media_urls createdAt updatedAt"
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
    progress_status: progressStatus,
    media_urls: mediaUrls,
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

  if (progressStatus !== undefined) {
    if (!PROGRESS_STATUS.includes(progressStatus)) {
      throw getStatusError("Invalid progress_status", 400);
    }
    activity.progress_status = progressStatus;
  }

  if (mediaUrls !== undefined) {
    activity.media_urls = mediaUrls;
  }

  await activity.save();

  return Activity.findById(activity._id)
    .populate("created_by", "_id full_name email avatar_url")
    .populate("club_id", "_id name logo_url")
    .select(
      "_id club_id created_by title description location start_time end_time status progress_status media_urls createdAt updatedAt"
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
const ClubMember = require("../../models/club_member.model");
const { awardRewardPoints } = require("../pointsAward.helper");

const getActivityAttendance = async (clubId, activityId) => {
  const activity = await Activity.findOne({ _id: activityId, club_id: clubId });
  if (!activity) {
    throw getStatusError("Activity not found", 404);
  }

  const attendances = await ActivityAttendance.find({
    activity_id: activityId,
    club_id: clubId,
  })
    .populate("user_id", "_id full_name email avatar_url")
    .lean();

  const members = await ClubMember.find({ club_id: clubId, status: "active" })
    .populate("user_id", "_id full_name email avatar_url")
    .lean();

  const attendanceMap = new Map();
  attendances.forEach((att) => {
    const uid = String(att.user_id?._id || att.user_id);
    attendanceMap.set(uid, att);
  });

  const memberList = members.map((m) => {
    const userId = String(m.user_id?._id || m.user_id);
    const existing = attendanceMap.get(userId);
    return {
      id: userId,
      membershipId: m._id,
      name: m.user_id?.full_name || "Thành viên",
      email: m.user_id?.email || "",
      avatarUrl: m.user_id?.avatar_url || "",
      checked: existing ? existing.status === "attended" : false,
      status: existing ? existing.status : "pending",
      pointsAwarded: existing ? existing.points_awarded : 0,
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

  let awardedCount = 0;

  for (const item of memberAttendanceList) {
    const { userId, checked } = item;
    if (!userId) continue;

    const member = await ClubMember.findOne({ user_id: userId, club_id: clubId, status: "active" });
    if (!member) continue;

    const status = checked ? "attended" : "absent";

    await ActivityAttendance.findOneAndUpdate(
      { activity_id: activityId, membership_id: member._id },
      {
        club_id: clubId,
        user_id: userId,
        status,
        check_in_time: checked ? new Date() : null,
        checked_by: adminUserId,
      },
      { upsert: true, new: true }
    );

    if (checked) {
      const awardRes = await awardRewardPoints({
        clubId,
        userId,
        actionTypeCode: "meeting",
        eventId: activityId,
        presidentId: adminUserId,
      });

      if (!awardRes) {
        await awardRewardPoints({
          clubId,
          userId,
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
