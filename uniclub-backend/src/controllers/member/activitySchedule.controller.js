const mongoose = require("mongoose");
const activityScheduleService = require("../../services/member/activitySchedule.service");
const { getStatusError } = require("../../utils/error");

const getClubActivitySchedule = async (req, res, next) => {
  try {
    const { clubId } = req.params;
    const { start_date: startDate, end_date: endDate, search, page, limit } = req.query;

    if (!mongoose.Types.ObjectId.isValid(clubId)) {
      return next(getStatusError("Invalid clubId", 400));
    }

    if (startDate && Number.isNaN(new Date(startDate).getTime())) {
      return next(getStatusError("Invalid start_date", 400));
    }

    if (endDate && Number.isNaN(new Date(endDate).getTime())) {
      return next(getStatusError("Invalid end_date", 400));
    }

    const data = await activityScheduleService.getClubActivitySchedule(clubId, {
      start_date: startDate,
      end_date: endDate,
      search,
      page,
      limit,
    });

    return res.status(200).json({
      success: true,
      message: "Activity schedule retrieved successfully",
      data,
    });
  } catch (error) {
    next(error);
  }
};

const getActivityScheduleDetail = async (req, res, next) => {
  try {
    const { clubId, activityId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(clubId)) {
      return next(getStatusError("Invalid clubId", 400));
    }

    if (!mongoose.Types.ObjectId.isValid(activityId)) {
      return next(getStatusError("Invalid activityId", 400));
    }

    const data = await activityScheduleService.getActivityScheduleDetail(clubId, activityId);

    return res.status(200).json({
      success: true,
      message: "Activity detail retrieved successfully",
      data,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getClubActivitySchedule,
  getActivityScheduleDetail,
};
