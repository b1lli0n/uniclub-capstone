const mongoose = require("mongoose");
const EventCreationRequest = require("../models/event_creation_request.model");
const Event = require("../models/event.model");
const { getStatusError } = require("../utils/error");

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

const createEventRequest = async (req, res, next) => {
  try {
    const { clubId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(clubId)) {
      return next(getStatusError("Invalid clubId", 400));
    }
    if (!req.user?.id) {
      return next(getStatusError("User not authenticated", 401));
    }

    const { body } = req;
    
    const title = parseRequiredString(body.title, "title");
    const description = parseRequiredString(body.description, "description");
    const content = parseRequiredString(body.content, "content");
    const category = parseRequiredString(body.category, "category");
    const location = parseRequiredString(body.location, "location");
    const approval_document_url = parseRequiredString(body.approval_document_url, "approval_document_url");

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

    const newRequest = new EventCreationRequest({
      club_id: clubId,
      requested_by: req.user.id,
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
      media_uris: mediaUris,
      approval_document_url,
      status: "pending",
    });

    const savedRequest = await newRequest.save();

    // Trigger Real-time Email Notification to Admin
    try {
      const { sendEventRequestSubmittedEmailToAdmin } = require("../services/email.service");
      const Club = require("../models/club.model");
      const User = require("../models/user.model");
      
      const clubDoc = await Club.findById(clubId);
      const userDoc = await User.findById(req.user.id);
      
      sendEventRequestSubmittedEmailToAdmin({
        clubName: clubDoc?.name || "Guitar Club",
        requesterName: userDoc?.full_name || req.user.email || "Ban Sự Kiện",
        eventTitle: title,
        documentUrl: approval_document_url,
      });
    } catch (emailErr) {
      console.error("Failed to send admin event request email:", emailErr);
    }

    return res.status(201).json({
      success: true,
      message: "Event creation request submitted successfully",
      data: savedRequest,
    });
  } catch (error) {
    next(error);
  }
};

const getEventRequests = async (req, res, next) => {
  try {
    const { status } = req.query;
    const filter = {};
    if (status) {
      filter.status = status;
    }

    const requests = await EventCreationRequest.find(filter)
      .populate("club_id", "name logo_url")
      .populate("requested_by", "full_name email avatar_url")
      .sort({ created_at: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      data: requests,
    });
  } catch (error) {
    next(error);
  }
};

const getMyEventRequests = async (req, res, next) => {
  try {
    const requests = await EventCreationRequest.find({ requested_by: req.user.id })
      .populate("club_id", "name logo_url")
      .sort({ created_at: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      data: requests,
    });
  } catch (error) {
    next(error);
  }
};

const getEventRequestDetail = async (req, res, next) => {
  try {
    const { requestId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(requestId)) {
      return next(getStatusError("Invalid requestId", 400));
    }

    const request = await EventCreationRequest.findById(requestId)
      .populate("club_id", "name logo_url")
      .populate("requested_by", "full_name email avatar_url")
      .populate("reviewed_by", "full_name email")
      .lean();

    if (!request) {
      return next(getStatusError("Event creation request not found", 404));
    }

    return res.status(200).json({
      success: true,
      data: request,
    });
  } catch (error) {
    next(error);
  }
};

const approveEventRequest = async (req, res, next) => {
  try {
    const { requestId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(requestId)) {
      return next(getStatusError("Invalid requestId", 400));
    }

    const request = await EventCreationRequest.findById(requestId);
    if (!request) {
      return next(getStatusError("Event creation request not found", 404));
    }

    if (request.status !== "pending") {
      return next(getStatusError("Request is not pending", 400));
    }

    // Update request status
    request.status = "approved";
    request.reviewed_by = req.user.id;
    request.reviewed_at = new Date();
    await request.save();

    // Create Event
    const newEvent = new Event({
      club_id: request.club_id,
      created_by: request.requested_by, // Or admin ID depending on business logic
      title: request.title,
      description: request.description,
      content: request.content,
      category: request.category,
      start_time: request.start_time,
      end_time: request.end_time,
      location: request.location,
      is_public: request.is_public,
      capacity: request.capacity,
      multiplier: request.multiplier,
      media_uris: request.media_uris,
      status: "coming soon",
      progress_status: "draft",
      check_in_status: "not_open",
      approval_document_url: request.approval_document_url || "",
    });

    const savedEvent = await newEvent.save();

    // Trigger Real-time Email Notification to Requester Student
    try {
      const { sendEventRequestResultEmailToRequester } = require("../services/email.service");
      const Club = require("../models/club.model");
      const User = require("../models/user.model");
      
      const clubDoc = await Club.findById(request.club_id);
      const userDoc = await User.findById(request.requested_by);
      
      if (userDoc?.email) {
        sendEventRequestResultEmailToRequester({
          toEmail: userDoc.email,
          userName: userDoc.full_name || "Thành viên Ban Sự Kiện",
          clubName: clubDoc?.name || "Guitar Club",
          eventTitle: request.title,
          isApproved: true,
        });
      }
    } catch (emailErr) {
      console.error("Failed to send approval result email:", emailErr);
    }

    return res.status(200).json({
      success: true,
      message: "Event creation request approved",
      data: {
        request,
        event: savedEvent,
      },
    });
  } catch (error) {
    next(error);
  }
};

const rejectEventRequest = async (req, res, next) => {
  try {
    const { requestId } = req.params;
    const { review_note } = req.body;

    if (!mongoose.Types.ObjectId.isValid(requestId)) {
      return next(getStatusError("Invalid requestId", 400));
    }

    if (!review_note || !review_note.trim()) {
      return next(getStatusError("Review note is required for rejection", 400));
    }

    const request = await EventCreationRequest.findById(requestId);
    if (!request) {
      return next(getStatusError("Event creation request not found", 404));
    }

    if (request.status !== "pending") {
      return next(getStatusError("Request is not pending", 400));
    }

    // Update request status
    request.status = "rejected";
    request.review_note = review_note.trim();
    request.reviewed_by = req.user.id;
    request.reviewed_at = new Date();
    await request.save();

    // Trigger Real-time Email Notification to Requester Student
    try {
      const { sendEventRequestResultEmailToRequester } = require("../services/email.service");
      const Club = require("../models/club.model");
      const User = require("../models/user.model");
      
      const clubDoc = await Club.findById(request.club_id);
      const userDoc = await User.findById(request.requested_by);
      
      if (userDoc?.email) {
        sendEventRequestResultEmailToRequester({
          toEmail: userDoc.email,
          userName: userDoc.full_name || "Thành viên Ban Sự Kiện",
          clubName: clubDoc?.name || "Guitar Club",
          eventTitle: request.title,
          isApproved: false,
          reviewNote: review_note.trim(),
        });
      }
    } catch (emailErr) {
      console.error("Failed to send rejection result email:", emailErr);
    }

    return res.status(200).json({
      success: true,
      message: "Event creation request rejected",
      data: request,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createEventRequest,
  getEventRequests,
  getMyEventRequests,
  getEventRequestDetail,
  approveEventRequest,
  rejectEventRequest,
};
