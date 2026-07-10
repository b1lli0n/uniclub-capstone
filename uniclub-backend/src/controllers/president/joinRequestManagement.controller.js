const mongoose = require("mongoose");
const joinRequestManagementService = require("../../services/president/joinRequestManagement.service");
const { getStatusError } = require("../../utils/error");

const ALLOWED_JOIN_REQUEST_STATUS = ["pending", "approved", "rejected", "cancelled"];

const getJoinRequestList = async (req, res, next) => {
  try {
    const { clubId } = req.params;
    const { status } = req.query;

    if (!mongoose.Types.ObjectId.isValid(clubId)) {
      return next(getStatusError("Invalid clubId", 400));
    }

    if (status && !ALLOWED_JOIN_REQUEST_STATUS.includes(status)) {
      return next(
        getStatusError(
          "Invalid status. Allowed values: pending, approved, rejected, cancelled",
          400
        )
      );
    }

    const data = await joinRequestManagementService.getJoinRequestList(clubId, { status });

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
    const { clubId, requestId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(clubId)) {
      return next(getStatusError("Invalid clubId", 400));
    }

    if (!mongoose.Types.ObjectId.isValid(requestId)) {
      return next(getStatusError("Invalid requestId", 400));
    }

    const data = await joinRequestManagementService.getJoinRequestDetail(clubId, requestId);

    return res.status(200).json({
      success: true,
      message: "Join request detail retrieved successfully",
      data,
    });
  } catch (error) {
    next(error);
  }
};

const approveJoinRequest = async (req, res, next) => {
  try {
    const { clubId, requestId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(clubId)) {
      return next(getStatusError("Invalid clubId", 400));
    }

    if (!mongoose.Types.ObjectId.isValid(requestId)) {
      return next(getStatusError("Invalid requestId", 400));
    }

    const data = await joinRequestManagementService.approveJoinRequest(
      req.user.id,
      clubId,
      requestId
    );

    return res.status(200).json({
      success: true,
      message: "Join request approved successfully",
      data,
    });
  } catch (error) {
    next(error);
  }
};

const rejectJoinRequest = async (req, res, next) => {
  try {
    const { clubId, requestId } = req.params;
    const { review_note: reviewNote } = req.body;

    if (!mongoose.Types.ObjectId.isValid(clubId)) {
      return next(getStatusError("Invalid clubId", 400));
    }

    if (!mongoose.Types.ObjectId.isValid(requestId)) {
      return next(getStatusError("Invalid requestId", 400));
    }

    if (reviewNote !== undefined && typeof reviewNote !== "string") {
      return next(getStatusError("review_note must be a string", 400));
    }

    const data = await joinRequestManagementService.rejectJoinRequest(
      req.user.id,
      clubId,
      requestId,
      reviewNote || ""
    );

    return res.status(200).json({
      success: true,
      message: "Join request rejected successfully",
      data,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getJoinRequestList,
  getJoinRequestDetail,
  approveJoinRequest,
  rejectJoinRequest,
};
