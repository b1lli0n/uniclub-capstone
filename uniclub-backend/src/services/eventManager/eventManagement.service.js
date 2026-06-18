const Event = require("../../models/event.model");
const { getStatusError } = require("../../utils/error");

const EVENT_SELECT =
  "_id club_id title description category start_time end_time location status progress_status is_public capacity media_uris created_at updated_at";

const CLUB_POPULATE = {
  path: "club_id",
  select: "_id name logo_url category status",
};

const getCompletedEvents = async (clubId) => {
  return Event.find({
    club_id: clubId,
    progress_status: "completed",
    status: { $ne: "cancelled" },
  })
    .sort({ start_time: -1 })
    .populate(CLUB_POPULATE)
    .select(EVENT_SELECT);
};

const getDraftEvents = async (clubId) => {
  return Event.find({
    club_id: clubId,
    progress_status: "draft",
    status: { $ne: "cancelled" },
  })
    .sort({ created_at: -1 })
    .populate(CLUB_POPULATE)
    .select(EVENT_SELECT);
};

const getEvents = async (clubId, { progress_status } = {}) => {
  if (progress_status === "completed") {
    return getCompletedEvents(clubId);
  }

  if (progress_status === "draft") {
    return getDraftEvents(clubId);
  }

  const [completed, draft] = await Promise.all([
    getCompletedEvents(clubId),
    getDraftEvents(clubId),
  ]);

  return {
    completed,
    draft,
  };
};

const getEventDetail = async (clubId, eventId) => {
  const event = await Event.findOne({
    _id: eventId,
    club_id: clubId,
  })
    .populate("club_id", "_id name logo_url category status description")
    .populate("created_by", "_id full_name email avatar_url")
    .select("_id club_id created_by title description content category start_time end_time location is_public capacity multiplier status progress_status check_in_status media_uris feedback_summary created_at updated_at");

  if (!event) {
    throw getStatusError("Event not found", 404);
  }

  return event;
};

module.exports = {
  getEvents,
  getEventDetail,
};
