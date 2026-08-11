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

const approveJoinRequest = async (req, res, next) => {
  try {
    const { clubId, requestId } = req.params;
    const presidentId = req.user._id;
    const result = await joinRequestManagementService.approveJoinRequest(presidentId, clubId, requestId);
    return res.status(200).json({
      success: true,
      data: result,
      message: "Approved join request successfully",
    });
  } catch (error) {
    next(error);
  }
};

const rejectJoinRequest = async (req, res, next) => {
  try {
    const { clubId, requestId } = req.params;
    const { review_note } = req.body;
    const presidentId = req.user._id;
    const result = await joinRequestManagementService.rejectJoinRequest(presidentId, clubId, requestId, review_note);
    return res.status(200).json({
      success: true,
      data: result,
      message: "Rejected join request successfully",
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
