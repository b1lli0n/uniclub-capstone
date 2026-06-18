const mongoose = require("mongoose");
const feedbackManagementService = require("../../services/student/feedbackManagement.service");
const { getStatusError } = require("../../utils/error");

const getFeedbackEvent = async (req, res, next) => {
  try {
    const { eventId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      return next(getStatusError("Invalid eventId", 400));
    }

    const data = await feedbackManagementService.getFeedbackEvent(req.user.id, eventId);

    return res.status(200).json({
      success: true,
      message: "Event feedback retrieved successfully",
      data
    });
  } catch (error) {
    next(error);
  }
};

const createFeedbackEvent = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    const { rating, comment } = req.body;

    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      return next(getStatusError("Invalid eventId", 400));
    }

    if (rating === undefined || rating === null) {
      return next(getStatusError("rating is required", 400));
    }

    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return next(getStatusError("rating must be an integer from 1 to 5", 400));
    }

    if (typeof comment !== "string" || !comment.trim()) {
      return next(getStatusError("comment is required", 400));
    }

    const feedback = await feedbackManagementService.createFeedbackEvent(
      req.user.id,
      eventId,
      { rating, comment: comment.trim() }
    );

    return res.status(201).json({
      success: true,
      message: "Feedback submitted successfully",
      data: feedback
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getFeedbackEvent,
  createFeedbackEvent
};
