const mongoose = require("mongoose");
const Event = require("../models/event.model");
const ClubMember = require("../models/club_member.model");
const EventTimeline = require("../models/event_timeline.model");

const TIMELINE_MANAGE_ROLES = ["president", "leader", "secretary", "event_manager"];

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const createError = (message, statusCode = 400) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const validateObjectId = (id, fieldName) => {
  if (!id) {
    throw createError(`${fieldName} is required`, 400);
  }

  if (!isValidObjectId(id)) {
    throw createError(`Invalid ${fieldName}`, 400);
  }
};

const validateRequiredText = (value, fieldName) => {
  if (!value || !value.trim()) {
    throw createError(`${fieldName} is required`, 400);
  }

  return value.trim();
};

const validateTimeFormat = (time) => {
  if (!time || !time.trim()) {
    throw createError("Time is required", 400);
  }

  const normalizedTime = time.trim();

  const timeRegex = /^([01]\d|2[0-3]):[0-5]\d$/;

  if (!timeRegex.test(normalizedTime)) {
    throw createError("Time must be in HH:mm format", 400);
  }

  return normalizedTime;
};

const getEventById = async (eventId) => {
  validateObjectId(eventId, "event ID");

  const event = await Event.findById(eventId);

  if (!event) {
    throw createError("Event not found", 404);
  }

  return event;
};

const buildTimelineDate = ({ event, time }) => {
  const normalizedTime = validateTimeFormat(time);
  const [hour, minute] = normalizedTime.split(":").map(Number);

  const eventStart = new Date(event.start_time);
  const eventEnd = new Date(event.end_time);

  const candidates = [];

  const sameDayCandidate = new Date(eventStart);
  sameDayCandidate.setHours(hour, minute, 0, 0);
  candidates.push(sameDayCandidate);

  const nextDayCandidate = new Date(eventStart);
  nextDayCandidate.setDate(nextDayCandidate.getDate() + 1);
  nextDayCandidate.setHours(hour, minute, 0, 0);
  candidates.push(nextDayCandidate);

  const timelineAt = candidates.find(
    (candidate) => candidate >= eventStart && candidate <= eventEnd
  );

  if (!timelineAt) {
    throw createError("Timeline time must be within event time range", 400);
  }

  return {
    time: normalizedTime,
    timeline_at: timelineAt,
  };
};

const validateEventCanManageTimeline = (event) => {
  if (event.status === "cancelled") {
    throw createError("Cannot manage timeline of a cancelled event", 400);
  }
};

const checkTimelineManagePermission = async ({ event, userId }) => {
  validateObjectId(userId, "user ID");

  const isEventCreator = event.created_by.toString() === userId.toString();

  if (isEventCreator) {
    return true;
  }

  const clubMember = await ClubMember.findOne({
    club_id: event.club_id,
    user_id: userId,
    status: "active",
  });

  if (!clubMember) {
    throw createError("You are not an active member of this club", 403);
  }

  if (!TIMELINE_MANAGE_ROLES.includes(clubMember.role)) {
    throw createError("You do not have permission to manage event timeline", 403);
  }

  return true;
};

const getTimelineById = async ({ eventId, timelineId }) => {
  validateObjectId(timelineId, "timeline ID");

  const timeline = await EventTimeline.findOne({
    _id: timelineId,
    event_id: eventId,
  });

  if (!timeline) {
    throw createError("Timeline item not found", 404);
  }

  return timeline;
};

const getEventTimelines = async ({ eventId }) => {
  await getEventById(eventId);

  const timelines = await EventTimeline.find({
    event_id: eventId,
  })
    .sort({ timeline_at: 1, created_at: 1 })
    .select("-__v");

  return timelines;
};

const createEventTimeline = async ({
  eventId,
  userId,
  time,
  title,
  description,
  location,
}) => {
  const event = await getEventById(eventId);

  validateEventCanManageTimeline(event);

  await checkTimelineManagePermission({
    event,
    userId,
  });

  const timelineDate = buildTimelineDate({
    event,
    time,
  });

  const timeline = await EventTimeline.create({
    event_id: eventId,
    time: timelineDate.time,
    timeline_at: timelineDate.timeline_at,
    title: validateRequiredText(title, "Title"),
    description: validateRequiredText(description, "Description"),
    location: validateRequiredText(location, "Location"),
    created_by: userId,
  });

  return timeline;
};

const updateEventTimeline = async ({
  eventId,
  timelineId,
  userId,
  time,
  title,
  description,
  location,
}) => {
  const event = await getEventById(eventId);

  validateEventCanManageTimeline(event);

  await checkTimelineManagePermission({
    event,
    userId,
  });

  const timeline = await getTimelineById({
    eventId,
    timelineId,
  });

  if (time !== undefined) {
    const timelineDate = buildTimelineDate({
      event,
      time,
    });

    timeline.time = timelineDate.time;
    timeline.timeline_at = timelineDate.timeline_at;
  }

  if (title !== undefined) {
    timeline.title = validateRequiredText(title, "Title");
  }

  if (description !== undefined) {
    timeline.description = validateRequiredText(description, "Description");
  }

  if (location !== undefined) {
    timeline.location = validateRequiredText(location, "Location");
  }

  timeline.updated_by = userId;

  await timeline.save();

  return timeline;
};

const deleteEventTimeline = async ({ eventId, timelineId, userId }) => {
  const event = await getEventById(eventId);

  validateEventCanManageTimeline(event);

  await checkTimelineManagePermission({
    event,
    userId,
  });

  const timeline = await getTimelineById({
    eventId,
    timelineId,
  });

  await timeline.deleteOne();

  return {
    timeline_id: timelineId,
    deleted: true,
  };
};

module.exports = {
  getEventTimelines,
  createEventTimeline,
  updateEventTimeline,
  deleteEventTimeline,
};