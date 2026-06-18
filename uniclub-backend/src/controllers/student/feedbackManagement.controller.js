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

module.exports = {
  getFeedbackEvent
};
