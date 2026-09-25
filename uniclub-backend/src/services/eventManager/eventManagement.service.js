const Event = require("../../models/event.model");
const Club = require("../../models/club.model");
const ClubMember = require("../../models/club_member.model");
const { uploadEventMedia } = require("../../utils/cloudinary.util");
const { getStatusError } = require("../../utils/error");

const EVENT_SELECT =
  "_id club_id title description category start_time end_time location status progress_status is_public capacity media_uris approval_document_url created_at updated_at";

const CLUB_POPULATE = {
  path: "club_id",
  select: "_id name logo_url category status",
};

const CREATED_BY_POPULATE = {
  path: "created_by",
  populate: { path: "user_id", select: "_id full_name email avatar_url" },
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
    .populate(CREATED_BY_POPULATE)
    .select("_id club_id created_by title description category start_time end_time location is_public capacity status progress_status check_in_status media_uris feedback_summary created_at updated_at");

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

  const creatorMember = await ClubMember.findOne({
    club_id: clubId,
    user_id: userId,
    status: "active",
  });

  const processedPayload = { ...payload };
  if (Array.isArray(processedPayload.media_uris) && processedPayload.media_uris.length > 0) {
    processedPayload.media_uris = await Promise.all(
      processedPayload.media_uris.map((uri) => uploadEventMedia(uri))
    );
  }

  const event = await Event.create({
    club_id: clubId,
    created_by: creatorMember ? creatorMember._id : userId,
    status: "opening",
    progress_status: "completed",
    check_in_status: "open",
    is_public: true,
    ...processedPayload,
  });

  return Event.findById(event._id)
    .populate("club_id", "_id name logo_url category status")
    .populate(CREATED_BY_POPULATE)
    .select(
      "_id club_id created_by title description category start_time end_time location is_public capacity status progress_status check_in_status media_uris created_at updated_at"
    );
};

const updateEvent = async (clubId, eventId, payload) => {
  const event = await Event.findById(eventId);

  if (!event) {
    throw getStatusError("Event not found", 404);
  }

  if (clubId && event.club_id.toString() !== clubId.toString()) {
    throw getStatusError("Event does not belong to this club", 403);
  }

  if (event.status === "cancelled") {
    throw getStatusError("Cannot update cancelled event", 400);
  }

  // If event is already published (progress_status === completed), allow updating operational status and check_in_status
  if (event.progress_status === "completed") {
    const allowedKeys = ["status", "operational_status", "check_in_status"];
    const payloadKeys = Object.keys(payload);
    const hasCoreFieldChanges = payloadKeys.some((k) => {
      if (allowedKeys.includes(k)) return false;
      if (payload[k] === undefined) return false;
      if (k === "start_time" || k === "end_time") {
        return new Date(payload[k]).getTime() !== new Date(event[k]).getTime();
      }
      return payload[k] !== event[k];
    });

    if (hasCoreFieldChanges) {
      throw getStatusError("Cannot update event details because it is already marked as completed. Only operational status can be changed.", 400);
    }

    if (payload.status || payload.operational_status) {
      event.status = payload.status || payload.operational_status;
    }
    if (payload.check_in_status) {
      event.check_in_status = payload.check_in_status;
    }
    await event.save();

    return Event.findById(event._id)
      .populate("club_id", "_id name logo_url category status")
      .populate(CREATED_BY_POPULATE)
      .select(
        "_id club_id created_by title description category start_time end_time location is_public capacity status progress_status check_in_status media_uris approval_document_url created_at updated_at"
      );
  }

  if (payload.progress_status === "completed") {
    const EventTimeline = require("../../models/event_timeline.model");
    const timelineCount = await EventTimeline.countDocuments({ event_id: eventId });
    if (timelineCount === 0) {
      throw getStatusError(
        "Cannot complete event without a timeline. Please add at least one timeline item before marking the event as complete.",
        400
      );
    }
  }

  if (payload.progress_status === "draft" && event.progress_status === "completed") {
    if (event.status !== "coming_soon") {
      throw getStatusError(
        "Cannot revert completed event back to draft when operational status is not 'coming_soon'",
        400
      );
    }
  }

  const startTime = payload.start_time ?? event.start_time;
  const endTime = payload.end_time ?? event.end_time;

  if (payload.start_time && new Date(payload.start_time) < new Date()) {
    throw getStatusError("Event start time cannot be updated to the past. Please choose a future date and time.", 400);
  }

  if (startTime >= endTime) {
    throw getStatusError("Start time must be before end time. Please select a valid event time range.", 400);
  }

  const processedPayload = { ...payload };
  if (Array.isArray(processedPayload.media_uris) && processedPayload.media_uris.length > 0) {
    processedPayload.media_uris = await Promise.all(
      processedPayload.media_uris.map((uri) => uploadEventMedia(uri))
    );
  }

  Object.assign(event, processedPayload);
  await event.save();

  return Event.findById(event._id)
    .populate("club_id", "_id name logo_url category status")
    .populate(CREATED_BY_POPULATE)
    .select(
      "_id club_id created_by title description category start_time end_time location is_public capacity status progress_status check_in_status media_uris approval_document_url created_at updated_at"
    );
};

const cancelEvent = async (clubId, eventId) => {
  const event = await Event.findById(eventId);

  if (!event) {
    throw getStatusError("Event not found", 404);
  }

  if (event.status === "cancelled") {
    throw getStatusError("Event is already cancelled", 400);
  }

  if (["completed", "closed"].includes(event.status)) {
    throw getStatusError("Cannot cancel an event that has already ended or is completed", 400);
  }

  if (event.status === "ongoing" || (event.start_time && new Date(event.start_time) <= new Date())) {
    throw getStatusError("Cannot cancel an ongoing event or an event that has already started", 400);
  }

  event.status = "cancelled";
  event.check_in_status = "closed";
  await event.save();

  return Event.findById(event._id)
    .populate("club_id", "_id name logo_url category status")
    .populate(CREATED_BY_POPULATE)
    .select(
      "_id club_id created_by title description category start_time end_time location is_public capacity status progress_status check_in_status media_uris created_at updated_at"
    );
};

module.exports = {
  getEvents,
  getEventDetail,
  createEvent,
  updateEvent,
  cancelEvent,
};
