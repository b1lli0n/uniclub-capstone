const Event = require("../../models/event.model");
const Feedback = require("../../models/feedback.model");
const { getStatusError } = require("../../utils/error");

const getFeedbackEvent = async (userId, eventId) => {
  const event = await Event.findById(eventId).select(
    "_id club_id title description start_time end_time location status progress_status feedback_summary"
  );

  if (!event) {
    throw getStatusError("Event not found", 404);
  }

  const [feedbacks, myFeedback] = await Promise.all([
    Feedback.find({ event_id: eventId })
      .sort({ created_at: -1 })
      .populate("user_id", "_id full_name avatar_url")
      .select("_id user_id rating comment created_at"),
    Feedback.findOne({ event_id: eventId, user_id: userId })
      .select("_id rating comment created_at")
  ]);

  return {
    event,
    feedbacks,
    myFeedback
  };
};

const createFeedbackEvent = async (userId, eventId, { rating, comment }) => {
  const event = await Event.findById(eventId).select("_id title status progress_status");

  if (!event) {
    throw getStatusError("Event not found", 404);
  }

  if (event.status === "cancelled") {
    throw getStatusError("Cannot submit feedback for cancelled event", 400);
  }

  if (event.progress_status !== "completed" && event.status !== "closed") {
    throw getStatusError("Event is not available for feedback yet", 400);
  }

  const existingFeedback = await Feedback.findOne({
    event_id: eventId,
    user_id: userId
  });

  if (existingFeedback) {
    throw getStatusError("You have already submitted feedback for this event", 409);
  }

  const feedback = await Feedback.create({
    event_id: eventId,
    user_id: userId,
    rating,
    comment
  });

  return feedback.populate([
    { path: "event_id", select: "_id title" },
    { path: "user_id", select: "_id full_name avatar_url" }
  ]);
};

module.exports = {
  getFeedbackEvent,
  createFeedbackEvent
};
