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

module.exports = {
  getJoinRequestList
};
