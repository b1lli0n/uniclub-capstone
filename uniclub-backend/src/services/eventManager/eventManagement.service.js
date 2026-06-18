const Event = require("../../models/event.model");

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

module.exports = {
  getEvents,
};
