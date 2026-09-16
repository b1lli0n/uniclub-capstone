const eventRequestService = require("../../services/eventRequest.service");

// Student Affairs: Get all event creation requests
const getEventRequests = async (req, res, next) => {
  try {
    const { status, sort } = req.query;
    const requests = await eventRequestService.getEventRequests({ status, sort });

    return res.status(200).json({
      success: true,
      data: requests,
    });
  } catch (error) {
    next(error);
  }
};

// Student Affairs: Get detail of an event request
const getEventRequestDetail = async (req, res, next) => {
  try {
    const { requestId } = req.params;
    const request = await eventRequestService.getEventRequestDetail(requestId);

    return res.status(200).json({
      success: true,
      data: request,
    });
  } catch (error) {
    next(error);
  }
};

// Student Affairs: Review an event request (Approve / Reject)
const reviewEventRequest = async (req, res, next) => {
  try {
    const { requestId } = req.params;
    const { status, review_note, reviewNote } = req.body;
    const note = review_note || reviewNote || "";

    const result = await eventRequestService.reviewEventRequest({
      requestId,
      status,
      reviewNote: note,
      reviewerId: req.user.id,
    });

    return res.status(200).json({
      success: true,
      message: `Event creation request ${result.status}`,
      data: result.status === "approved" ? { request: result.request, event: result.event } : result.request,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getEventRequests,
  getEventRequestDetail,
  reviewEventRequest,
};
