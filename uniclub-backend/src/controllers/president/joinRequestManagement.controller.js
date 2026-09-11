const joinRequestManagementService = require("../../services/president/joinRequestManagement.service");

const getJoinRequestList = async (req, res, next) => {
  try {
    const { clubId } = req.params;
    const { status } = req.query;
    const requests = await joinRequestManagementService.getJoinRequestList(clubId, { status });
    return res.status(200).json({
      success: true,
      data: requests,
    });
  } catch (error) {
    next(error);
  }
};

const getJoinRequestDetail = async (req, res, next) => {
  try {
    const { clubId, requestId } = req.params;
    const detail = await joinRequestManagementService.getJoinRequestDetail(clubId, requestId);
    return res.status(200).json({
      success: true,
      data: detail,
    });
  } catch (error) {
    next(error);
  }
};

const reviewJoinRequest = async (req, res, next) => {
  try {
    const { clubId, requestId } = req.params;
    const { status, review_note, reviewNote } = req.body;
    const presidentId = req.user._id || req.user.id;
    const result = await joinRequestManagementService.reviewJoinRequest(presidentId, clubId, requestId, {
      status,
      review_note: review_note || reviewNote || "",
    });
    return res.status(200).json({
      success: true,
      data: result,
      message: `${status === "approved" ? "Approved" : "Rejected"} join request successfully`,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getJoinRequestList,
  getJoinRequestDetail,
  reviewJoinRequest,
};
