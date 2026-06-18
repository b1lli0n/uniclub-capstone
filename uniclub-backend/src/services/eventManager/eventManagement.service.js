const Event = require("../../models/event.model");
const Club = require("../../models/club.model");
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

const assertActiveClub = async (clubId) => {
  const club = await Club.findById(clubId).select("_id status");

  if (!club) {
    throw getStatusError("Club not found", 404);
  }

  if (club.status !== "active") {
    throw getStatusError("Club is not active", 400);
  }

  return club;
};

const createEvent = async (clubId, userId, payload) => {
  await assertActiveClub(clubId);

  const event = await Event.create({
    club_id: clubId,
    created_by: userId,
    ...payload,
  });

  return Event.findById(event._id)
    .populate("club_id", "_id name logo_url category status")
    .populate("created_by", "_id full_name email avatar_url")
    .select(
      "_id club_id created_by title description content category start_time end_time location is_public capacity multiplier status progress_status check_in_status media_uris created_at updated_at"
    );
};

const updateEvent = async (clubId, eventId, payload) => {
  const event = await Event.findOne({
    _id: eventId,
    club_id: clubId,
  });

  if (!event) {
    throw getStatusError("Event not found", 404);
  }

  if (event.status === "cancelled") {
    throw getStatusError("Cannot update cancelled event", 400);
  }

  const startTime = payload.start_time ?? event.start_time;
  const endTime = payload.end_time ?? event.end_time;

  if (startTime >= endTime) {
    throw getStatusError("start_time must be before end_time", 400);
  }

  Object.assign(event, payload);
  await event.save();

  return Event.findById(event._id)
    .populate("club_id", "_id name logo_url category status")
    .populate("created_by", "_id full_name email avatar_url")
    .select(
      "_id club_id created_by title description content category start_time end_time location is_public capacity multiplier status progress_status check_in_status media_uris created_at updated_at"
    );
};

const cancelEvent = async (clubId, eventId) => {
  const event = await Event.findOne({
    _id: eventId,
    club_id: clubId,
  });

  if (!event) {
    throw getStatusError("Event not found", 404);
  }

  if (event.status === "cancelled") {
    throw getStatusError("Event is already cancelled", 400);
  }

  if (event.status === "closed") {
    throw getStatusError("Cannot cancel closed event", 400);
  }

  event.status = "cancelled";
  event.check_in_status = "closed";
  await event.save();

  return Event.findById(event._id)
    .populate("club_id", "_id name logo_url category status")
    .populate("created_by", "_id full_name email avatar_url")
    .select(
      "_id club_id created_by title description content category start_time end_time location is_public capacity multiplier status progress_status check_in_status media_uris created_at updated_at"
    );
};

module.exports = {
  getEvents,
  getEventDetail,
  createEvent,
  updateEvent,
  cancelEvent,
};
