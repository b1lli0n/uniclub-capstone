const mongoose = require("mongoose");
const activityScheduleService = require("../../services/secretary/activitySchedule.service");
const { getStatusError } = require("../../utils/error");

const getClubActivitySchedule = async (req, res, next) => {
  try {
    const { clubId } = req.params;
    const {
      start_date: startDate,
      end_date: endDate,
      search,
      status,
      progress_status: progressStatus,
      page,
      limit,
    } = req.query;

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
      status,
      progress_status: progressStatus,
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

const createActivity = async (req, res, next) => {
  try {
    const { clubId } = req.params;
    const {
      title,
      description,
      location,
      start_time: startTime,
      end_time: endTime,
      status,
      progress_status: progressStatus,
      media_urls: mediaUrls,
    } = req.body;

    if (!mongoose.Types.ObjectId.isValid(clubId)) {
      return next(getStatusError("Invalid clubId", 400));
    }

    if (!title || typeof title !== "string" || !title.trim()) {
      return next(getStatusError("title is required", 400));
    }

    if (!description || typeof description !== "string" || !description.trim()) {
      return next(getStatusError("description is required", 400));
    }

    if (!location || typeof location !== "string" || !location.trim()) {
      return next(getStatusError("location is required", 400));
    }

    if (!startTime || Number.isNaN(new Date(startTime).getTime())) {
      return next(getStatusError("Valid start_time is required", 400));
    }

    if (!endTime || Number.isNaN(new Date(endTime).getTime())) {
      return next(getStatusError("Valid end_time is required", 400));
    }

    if (mediaUrls !== undefined) {
      if (!Array.isArray(mediaUrls) || mediaUrls.some((url) => typeof url !== "string")) {
        return next(getStatusError("media_urls must be an array of strings", 400));
      }
    }

    const data = await activityScheduleService.createActivity(clubId, req.user.id, {
      title,
      description,
      location,
      start_time: startTime,
      end_time: endTime,
      status,
      progress_status: progressStatus,
      media_urls: mediaUrls,
    });

    return res.status(201).json({
      success: true,
      message: "Activity created successfully",
      data,
    });
  } catch (error) {
    next(error);
  }
};

const updateActivity = async (req, res, next) => {
  try {
    const { clubId, activityId } = req.params;
    const {
      title,
      description,
      location,
      start_time: startTime,
      end_time: endTime,
      status,
      progress_status: progressStatus,
      media_urls: mediaUrls,
    } = req.body;

    if (!mongoose.Types.ObjectId.isValid(clubId)) {
      return next(getStatusError("Invalid clubId", 400));
    }

    if (!mongoose.Types.ObjectId.isValid(activityId)) {
      return next(getStatusError("Invalid activityId", 400));
    }

    if (title !== undefined && (typeof title !== "string" || !title.trim())) {
      return next(getStatusError("title must be a non-empty string", 400));
    }

    if (
      description !== undefined &&
      (typeof description !== "string" || !description.trim())
    ) {
      return next(getStatusError("description must be a non-empty string", 400));
    }

    if (location !== undefined && (typeof location !== "string" || !location.trim())) {
      return next(getStatusError("location must be a non-empty string", 400));
    }

    if (startTime !== undefined && Number.isNaN(new Date(startTime).getTime())) {
      return next(getStatusError("Invalid start_time", 400));
    }

    if (endTime !== undefined && Number.isNaN(new Date(endTime).getTime())) {
      return next(getStatusError("Invalid end_time", 400));
    }

    if (mediaUrls !== undefined) {
      if (!Array.isArray(mediaUrls) || mediaUrls.some((url) => typeof url !== "string")) {
        return next(getStatusError("media_urls must be an array of strings", 400));
      }
    }

    const data = await activityScheduleService.updateActivity(clubId, activityId, {
      title,
      description,
      location,
      start_time: startTime,
      end_time: endTime,
      status,
      progress_status: progressStatus,
      media_urls: mediaUrls,
    });

    return res.status(200).json({
      success: true,
      message: "Activity updated successfully",
      data,
    });
  } catch (error) {
    next(error);
  }
};

const deleteActivity = async (req, res, next) => {
  try {
    const { clubId, activityId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(clubId)) {
      return next(getStatusError("Invalid clubId", 400));
    }

    if (!mongoose.Types.ObjectId.isValid(activityId)) {
      return next(getStatusError("Invalid activityId", 400));
    }

    await activityScheduleService.deleteActivity(clubId, activityId);

    return res.status(200).json({
      success: true,
      message: "Activity deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

const getActivityAttendance = async (req, res, next) => {
  try {
    const { clubId, activityId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(clubId) || !mongoose.Types.ObjectId.isValid(activityId)) {
      return next(getStatusError("Invalid parameters", 400));
    }

    const data = await activityScheduleService.getActivityAttendance(clubId, activityId);

    return res.status(200).json({
      success: true,
      message: "Activity attendance retrieved successfully",
      data,
    });
  } catch (error) {
    next(error);
  }
};

const saveActivityAttendance = async (req, res, next) => {
  try {
    const { clubId, activityId } = req.params;
    const { members } = req.body;

    if (!mongoose.Types.ObjectId.isValid(clubId) || !mongoose.Types.ObjectId.isValid(activityId)) {
      return next(getStatusError("Invalid parameters", 400));
    }

    if (!Array.isArray(members)) {
      return next(getStatusError("members must be an array", 400));
    }

    const data = await activityScheduleService.saveActivityAttendance(
      clubId,
      activityId,
      members,
      req.user.id
    );

    return res.status(200).json({
      success: true,
      message: "Activity attendance saved and points awarded successfully",
      data,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getClubActivitySchedule,
  getActivityScheduleDetail,
  createActivity,
  updateActivity,
  deleteActivity,
  getActivityAttendance,
  saveActivityAttendance,
};
