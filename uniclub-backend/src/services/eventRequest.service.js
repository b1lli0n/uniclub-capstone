const mongoose = require("mongoose");
const EventCreationRequest = require("../models/event_creation_request.model");
const Event = require("../models/event.model");
const ClubMember = require("../models/club_member.model");
const Club = require("../models/club.model");
const User = require("../models/user.model");
const { getStatusError } = require("../utils/error");
const {
  sendEventRequestSubmittedEmailToAdmin,
  sendEventRequestResultEmailToRequester,
} = require("./email.service");

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

const createEventRequest = async ({ clubId, userId, userEmail, body }) => {
  if (!mongoose.Types.ObjectId.isValid(clubId)) {
    throw getStatusError("Invalid clubId", 400);
  }
  if (!userId) {
    throw getStatusError("User not authenticated", 401);
  }

  const member = await ClubMember.findOne({ club_id: clubId, user_id: userId });
  if (!member) {
    throw getStatusError("You must be a member of this club to submit an event creation request", 403);
  }

  const title = parseRequiredString(body.title, "title");
  const description = parseRequiredString(body.description, "description");
  const category = parseRequiredString(body.category, "category");
  const location = parseRequiredString(body.location, "location");
  const approval_document_url = body.approval_document_url ? String(body.approval_document_url).trim() : "";

  const startTime = parseDate(body.start_time, "start_time");
  const endTime = parseDate(body.end_time, "end_time");

  if (startTime >= endTime) {
    throw getStatusError("start_time must be before end_time", 400);
  }

  const capacity = Number(body.capacity);
  if (!Number.isInteger(capacity) || capacity <= 0) {
    throw getStatusError("capacity must be a positive integer", 400);
  }

  let isPublic = true;
  if (body.is_public !== undefined) {
    if (typeof body.is_public !== "boolean") {
      throw getStatusError("is_public must be a boolean", 400);
    }
    isPublic = body.is_public;
  }

  const newRequest = new EventCreationRequest({
    club_id: clubId,
    requested_by: member._id,
    title,
    description,
    category,
    start_time: startTime,
    end_time: endTime,
    location,
    is_public: isPublic,
    capacity,
    approval_document_url,
    status: "pending",
  });

  const savedRequest = await newRequest.save();

  // Trigger Real-time Email Notification to Admin
  try {
    const clubDoc = await Club.findById(clubId);
    const userDoc = await User.findById(userId);

    sendEventRequestSubmittedEmailToAdmin({
      clubName: clubDoc?.name || "Guitar Club",
      requesterName: userDoc?.full_name || userEmail || "Ban Sự Kiện",
      eventTitle: title,
      documentUrl: approval_document_url,
    });
  } catch (emailErr) {
    console.error("Failed to send admin event request email:", emailErr);
  }

  return savedRequest;
};

const getEventRequests = async ({ status } = {}) => {
  const filter = {};
  if (status) {
    filter.status = status;
  }

  const requests = await EventCreationRequest.find(filter)
    .populate("club_id", "name logo_url")
    .populate({
      path: "requested_by",
      populate: { path: "user_id", select: "full_name email avatar_url" },
    })
    .sort({ created_at: -1 })
    .lean();

  return requests;
};

const getMyEventRequests = async (userId) => {
  const userMemberships = await ClubMember.find({ user_id: userId }).select("_id");
  const memberIds = userMemberships.map((m) => m._id);

  const requests = await EventCreationRequest.find({ requested_by: { $in: memberIds } })
    .populate("club_id", "name logo_url")
    .sort({ created_at: -1 })
    .lean();

  return requests;
};

const getEventRequestDetail = async (requestId) => {
  if (!mongoose.Types.ObjectId.isValid(requestId)) {
    throw getStatusError("Invalid requestId", 400);
  }

  const request = await EventCreationRequest.findById(requestId)
    .populate("club_id", "name logo_url")
    .populate({
      path: "requested_by",
      populate: { path: "user_id", select: "full_name email avatar_url" },
    })
    .populate("reviewed_by", "full_name email")
    .lean();

  if (!request) {
    throw getStatusError("Event creation request not found", 404);
  }

  return request;
};

const reviewEventRequest = async ({ requestId, status, reviewNote, reviewerId }) => {
  const note = (reviewNote || "").trim();

  if (!mongoose.Types.ObjectId.isValid(requestId)) {
    throw getStatusError("Invalid requestId", 400);
  }

  if (!status || !["approved", "rejected"].includes(status)) {
    throw getStatusError("Invalid status. Allowed values: approved, rejected", 400);
  }

  if (status === "rejected" && !note) {
    throw getStatusError("Review note is required for rejection", 400);
  }

  const request = await EventCreationRequest.findById(requestId);
  if (!request) {
    throw getStatusError("Event creation request not found", 404);
  }

  if (request.status !== "pending") {
    throw getStatusError("Request is not pending", 400);
  }

  // Update request status
  request.status = status;
  request.review_note = note;
  request.reviewed_by = reviewerId;
  request.reviewed_at = new Date();
  await request.save();

  let savedEvent = null;
  if (status === "approved") {
    const newEvent = new Event({
      club_id: request.club_id,
      created_by: request.requested_by,
      title: request.title,
      description: request.description,
      category: request.category,
      start_time: request.start_time,
      end_time: request.end_time,
      location: request.location,
      is_public: request.is_public,
      capacity: request.capacity,
      status: "coming soon",
      progress_status: "draft",
      check_in_status: "not_open",
      approval_document_url: request.approval_document_url || "",
    });
    savedEvent = await newEvent.save();
  }

  // Trigger Real-time Email Notification to Requester Student
  try {
    const clubDoc = await Club.findById(request.club_id);
    const userDoc = await User.findById(request.requested_by);

    if (userDoc?.email) {
      sendEventRequestResultEmailToRequester({
        toEmail: userDoc.email,
        userName: userDoc.full_name || "Thành viên Ban Sự Kiện",
        clubName: clubDoc?.name || "Guitar Club",
        eventTitle: request.title,
        isApproved: status === "approved",
        reviewNote: note,
      });
    }
  } catch (emailErr) {
    console.error("Failed to send review result email:", emailErr);
  }

  return {
    request,
    event: savedEvent,
    status,
  };
};

module.exports = {
  createEventRequest,
  getEventRequests,
  getMyEventRequests,
  getEventRequestDetail,
  reviewEventRequest,
};
