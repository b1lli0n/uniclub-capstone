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

module.exports = {
  getFeedbackEvent
};
