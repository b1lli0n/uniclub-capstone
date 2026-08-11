const mongoose = require("mongoose");
const eventManagementService = require("../../services/eventManager/eventManagement.service");
const { getStatusError } = require("../../utils/error");

const ALLOWED_PROGRESS_STATUS = ["completed", "draft"];
const ALLOWED_CREATE_PROGRESS_STATUS = ["draft", "completed"];

const parseRequiredString = (value, fieldName) => {
  if (typeof value !== "string" || !value.trim()) {
    throw getStatusError(`${fieldName} is required`, 400);
  }

  return value.trim();
};

const parseDate = (value, fieldName) => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    throw getStatusError(`Invalid ${fieldName}`, 400);
  }

  return date;
};

const parseUpdateEventPayload = (body) => {
  const updates = {};

  if (body.title !== undefined) {
    updates.title = parseRequiredString(body.title, "title");
  }

  if (body.description !== undefined) {
    updates.description = parseRequiredString(body.description, "description");
  }

  if (body.content !== undefined) {
    updates.content = parseRequiredString(body.content, "content");
  }

  if (body.category !== undefined) {
    updates.category = parseRequiredString(body.category, "category");
  }

  if (body.location !== undefined) {
    updates.location = parseRequiredString(body.location, "location");
  }

  if (body.start_time !== undefined) {
    updates.start_time = parseDate(body.start_time, "start_time");
  }

  if (body.end_time !== undefined) {
    updates.end_time = parseDate(body.end_time, "end_time");
  }

  if (body.capacity !== undefined) {
    const capacity = Number(body.capacity);

    if (!Number.isInteger(capacity) || capacity <= 0) {
      throw getStatusError("capacity must be a positive integer", 400);
    }

    updates.capacity = capacity;
  }

  if (body.multiplier !== undefined) {
    const multiplier = Number(body.multiplier);

    if (!Number.isFinite(multiplier) || multiplier <= 0) {
      throw getStatusError("multiplier must be a positive number", 400);
    }

    updates.multiplier = multiplier;
  }

  if (body.is_public !== undefined) {
    if (typeof body.is_public !== "boolean") {
      throw getStatusError("is_public must be a boolean", 400);
    }

    updates.is_public = body.is_public;
  }

  if (body.status !== undefined) {
    updates.status = parseRequiredString(body.status, "status");
  }

  if (body.progress_status !== undefined) {
    if (!ALLOWED_CREATE_PROGRESS_STATUS.includes(body.progress_status)) {
      throw getStatusError("Invalid progress_status. Allowed values: draft, completed", 400);
    }

    updates.progress_status = body.progress_status;
  }

  if (body.media_uris !== undefined) {
    if (!Array.isArray(body.media_uris)) {
      throw getStatusError("media_uris must be an array", 400);
    }

    updates.media_uris = body.media_uris.map((uri, index) => {
      if (typeof uri !== "string" || !uri.trim()) {
        throw getStatusError(`media_uris[${index}] must be a non-empty string`, 400);
      }

      return uri.trim();
    });
  }

  if (!Object.keys(updates).length) {
    throw getStatusError("At least one field is required to update", 400);
  }

  return updates;
};

const parseCreateEventPayload = (body) => {
  const title = parseRequiredString(body.title, "title");
  const description = parseRequiredString(body.description, "description");
  const content = parseRequiredString(body.content, "content");
  const category = parseRequiredString(body.category, "category");
  const location = parseRequiredString(body.location, "location");

  const startTime = parseDate(body.start_time, "start_time");
  const endTime = parseDate(body.end_time, "end_time");

  if (startTime >= endTime) {
    throw getStatusError("start_time must be before end_time", 400);
  }

  const capacity = Number(body.capacity);

  if (!Number.isInteger(capacity) || capacity <= 0) {
    throw getStatusError("capacity must be a positive integer", 400);
  }

  let multiplier = 1;

  if (body.multiplier !== undefined && body.multiplier !== null && body.multiplier !== "") {
    multiplier = Number(body.multiplier);

    if (!Number.isFinite(multiplier) || multiplier <= 0) {
      throw getStatusError("multiplier must be a positive number", 400);
    }
  }

  let isPublic = true;

  if (body.is_public !== undefined) {
    if (typeof body.is_public !== "boolean") {
      throw getStatusError("is_public must be a boolean", 400);
    }

    isPublic = body.is_public;
  }

  let progressStatus = "draft";

  if (body.progress_status !== undefined) {
    if (!ALLOWED_CREATE_PROGRESS_STATUS.includes(body.progress_status)) {
      throw getStatusError("Invalid progress_status. Allowed values: draft, completed", 400);
    }

    progressStatus = body.progress_status;
  }

  let mediaUris = [];

  if (body.media_uris !== undefined) {
    if (!Array.isArray(body.media_uris)) {
      throw getStatusError("media_uris must be an array", 400);
    }

    mediaUris = body.media_uris.map((uri, index) => {
      if (typeof uri !== "string" || !uri.trim()) {
        throw getStatusError(`media_uris[${index}] must be a non-empty string`, 400);
      }

      return uri.trim();
    });
  }

  return {
    title,
    description,
    content,
    category,
    start_time: startTime,
    end_time: endTime,
    location,
    is_public: isPublic,
    capacity,
    multiplier,
    progress_status: progressStatus,
    media_uris: mediaUris,
  };
};

const getEvents = async (req, res, next) => {
  try {
    const { progress_status: progressStatus } = req.query;

    if (progressStatus && !ALLOWED_PROGRESS_STATUS.includes(progressStatus)) {
      return next(
        getStatusError("Invalid progress_status. Allowed values: completed, draft", 400)
      );
    }

    const data = await eventManagementService.getEvents(req.params.clubId, {
      progress_status: progressStatus,
    });

    return res.status(200).json({
      success: true,
      message: "Events retrieved successfully",
      data,
    });
  } catch (error) {
    next(error);
  }
};

const getEventDetail = async (req, res, next) => {
  try {
    const { clubId, eventId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(clubId)) {
      return next(getStatusError("Invalid clubId", 400));
    }

    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      return next(getStatusError("Invalid eventId", 400));
    }

    const data = await eventManagementService.getEventDetail(clubId, eventId);

    return res.status(200).json({
      success: true,
      message: "Event detail retrieved successfully",
      data,
    });
  } catch (error) {
    next(error);
  }
};

const createEvent = async (req, res, next) => {
  try {
    const { clubId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(clubId)) {
      return next(getStatusError("Invalid clubId", 400));
    }

    if (!req.user?.id) {
      return next(getStatusError("User not authenticated", 401));
    }

    const payload = parseCreateEventPayload(req.body);
    const data = await eventManagementService.createEvent(clubId, req.user.id, payload);

    return res.status(201).json({
      success: true,
      message: "Event created successfully",
      data,
    });
  } catch (error) {
    next(error);
  }
};

const updateEvent = async (req, res, next) => {
  try {
    const { clubId, eventId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(clubId)) {
      return next(getStatusError("Invalid clubId", 400));
    }

    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      return next(getStatusError("Invalid eventId", 400));
    }

    const payload = parseUpdateEventPayload(req.body);
    const data = await eventManagementService.updateEvent(clubId, eventId, payload);

    return res.status(200).json({
      success: true,
      message: "Event updated successfully",
      data,
    });
  } catch (error) {
    next(error);
  }
};

const cancelEvent = async (req, res, next) => {
  try {
    const { clubId, eventId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(clubId)) {
      return next(getStatusError("Invalid clubId", 400));
    }

    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      return next(getStatusError("Invalid eventId", 400));
    }

    const data = await eventManagementService.cancelEvent(clubId, eventId);

    return res.status(200).json({
      success: true,
      message: "Event cancelled successfully",
      data,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getEvents,
  getEventDetail,
  createEvent,
  updateEvent,
  cancelEvent,
};
