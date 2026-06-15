const mongoose = require("mongoose");
const joinRequestManagementService = require("../../services/president/joinRequestManagement.service");
const { JOIN_REQUEST_STATUS } = require("../../utils/constants");

const throwBadRequest = (message) => {
  throw Object.assign(new Error(message), { statusCode: 400 });
};

const assertValidObjectId = (id, label) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throwBadRequest(`Invalid ${label}`);
  }
};

const getUserId = (req) => {
  const userId = req.user?._id;

  if (!userId) {
    throw Object.assign(new Error("User ID is required. "), {
      statusCode: 401
    });
  }

  return userId;
};

const getJoinRequestList = async (req, res, next) => {
  try {
    const { clubId } = req.params;
    const { status } = req.query;

    assertValidObjectId(clubId, "clubId");

    if (status && !Object.values(JOIN_REQUEST_STATUS).includes(status)) {
      throwBadRequest(
        "Invalid status. Allowed values: pending, approved, rejected, cancelled"
      );
    }

    const joinRequests = await joinRequestManagementService.getJoinRequestList(
      getUserId(req),
      clubId,
      { status }
    );

    return res.status(200).json({
      success: true,
      message: "Join request list retrieved successfully",
      data: joinRequests
    });
  } catch (error) {
    next(error);
  }
};

const getJoinRequestDetail = async (req, res, next) => {
  try {
    const { clubId, requestId } = req.params;

    assertValidObjectId(clubId, "clubId");
    assertValidObjectId(requestId, "requestId");

    const joinRequest = await joinRequestManagementService.getJoinRequestDetail(
      getUserId(req),
      clubId,
      requestId
    );

    return res.status(200).json({
      success: true,
      message: "Join request detail retrieved successfully",
      data: joinRequest
    });
  } catch (error) {
    next(error);
  }
};

const approveJoinRequest = async (req, res, next) => {
  try {
    const { clubId, requestId } = req.params;

    assertValidObjectId(clubId, "clubId");
    assertValidObjectId(requestId, "requestId");

    const joinRequest = await joinRequestManagementService.approveJoinRequest(
      getUserId(req),
      clubId,
      requestId
    );

    return res.status(200).json({
      success: true,
      message: "Join request approved successfully",
      data: joinRequest
    });
  } catch (error) {
    next(error);
  }
};

const rejectJoinRequest = async (req, res, next) => {
  try {
    const { clubId, requestId } = req.params;
    const { review_note: reviewNote } = req.body;

    assertValidObjectId(clubId, "clubId");
    assertValidObjectId(requestId, "requestId");

    if (reviewNote !== undefined && typeof reviewNote !== "string") {
      throwBadRequest("review_note must be a string");
    }

    const joinRequest = await joinRequestManagementService.rejectJoinRequest(
      getUserId(req),
      clubId,
      requestId,
      reviewNote || ""
    );

    return res.status(200).json({
      success: true,
      message: "Join request rejected successfully",
      data: joinRequest
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getJoinRequestList,
  getJoinRequestDetail,
  approveJoinRequest,
  rejectJoinRequest
};