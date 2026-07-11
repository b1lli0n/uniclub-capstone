const Activity = require("../../models/activity.model");
const { getStatusError } = require("../../utils/error");

const parsePositiveInt = (value, fallback) => {
  const parsed = parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const buildActivityQuery = (clubId, filters = {}) => {
  const { start_date: startDate, end_date: endDate, search } = filters;
  const query = {
    club_id: clubId,
    progress_status: "published",
  };

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
    progress_status: "published",
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

module.exports = {
  getClubActivitySchedule,
  getActivityScheduleDetail,
};
