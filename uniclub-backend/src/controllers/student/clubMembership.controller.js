const mongoose = require("mongoose");
const clubMembershipService = require("../../services/student/clubMembership.service");
const { getStatusError } = require("../../utils/error");

const ALLOWED_JOIN_REQUEST_STATUS = ["pending", "approved", "rejected", "cancelled"];

const getClubJoinForm = async (req, res, next) => {
  try {
    const { clubId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(clubId)) {
      return next(getStatusError("Invalid clubId", 400));
    }

    const data = await clubMembershipService.getClubJoinForm(clubId);

    return res.status(200).json({
      success: true,
      message: "Join form retrieved successfully",
      data,
    });
  } catch (error) {
    next(error);
  }
};

const submitJoinRequest = async (req, res, next) => {
  try {
    const { clubId } = req.params;
    const { form_id: formId, answers } = req.body;

    if (!mongoose.Types.ObjectId.isValid(clubId)) {
      return next(getStatusError("Invalid clubId", 400));
    }

    if (!formId) {
      return next(getStatusError("form_id is required", 400));
    }

    if (!mongoose.Types.ObjectId.isValid(formId)) {
      return next(getStatusError("Invalid form_id", 400));
    }

    if (!Array.isArray(answers)) {
      return next(getStatusError("Answers must be an array", 400));
    }

    const data = await clubMembershipService.submitJoinRequest(
      req.user.id,
      clubId,
      formId,
      answers
    );

    return res.status(201).json({
      success: true,
      message: "Join request submitted successfully",
      data,
    });
  } catch (error) {
    next(error);
  }
};

const getMyJoinRequests = async (req, res, next) => {
  try {
    const { status } = req.query;

    if (status && !ALLOWED_JOIN_REQUEST_STATUS.includes(status)) {
      return next(
        getStatusError(
          "Invalid status. Allowed values: pending, approved, rejected, cancelled",
          400
        )
      );
    }

    const data = await clubMembershipService.getMyJoinRequests(req.user.id, { status });

    return res.status(200).json({
      success: true,
      message: "Join request list retrieved successfully",
      data,
    });
  } catch (error) {
    next(error);
  }
};

const getJoinRequestDetail = async (req, res, next) => {
  try {
    const { requestId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(requestId)) {
      return next(getStatusError("Invalid requestId", 400));
    }

    const data = await clubMembershipService.getJoinRequestDetail(req.user.id, requestId);

    return res.status(200).json({
      success: true,
      message: "Join request detail retrieved successfully",
      data,
    });
  } catch (error) {
    next(error);
  }
};

const cancelJoinRequest = async (req, res, next) => {
  try {
    const { requestId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(requestId)) {
      return next(getStatusError("Invalid requestId", 400));
    }

    const data = await clubMembershipService.cancelJoinRequest(req.user.id, requestId);

    return res.status(200).json({
      success: true,
      message: "Join request cancelled successfully",
      data,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getClubJoinForm,
  submitJoinRequest,
  getMyJoinRequests,
  getJoinRequestDetail,
  cancelJoinRequest,
};
