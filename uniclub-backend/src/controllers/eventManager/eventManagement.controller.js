const mongoose = require("mongoose");
const eventManagementService = require("../../services/eventManager/eventManagement.service");
const { getStatusError } = require("../../utils/error");

const ALLOWED_PROGRESS_STATUS = ["completed", "draft"];

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

module.exports = {
  getEvents,
  getEventDetail,
};
