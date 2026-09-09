const eventRequestService = require("../services/eventRequest.service");

const createEventRequest = async (req, res, next) => {
  try {
    const { clubId } = req.params;
    const savedRequest = await eventRequestService.createEventRequest({
      clubId,
      userId: req.user?.id,
      userEmail: req.user?.email,
      body: req.body,
    });

    return res.status(201).json({
      success: true,
      message: "Event creation request submitted successfully",
      data: savedRequest,
    });
  } catch (error) {
    next(error);
  }
};

const getEventRequests = async (req, res, next) => {
  try {
    const { status } = req.query;
    const requests = await eventRequestService.getEventRequests({ status });

    return res.status(200).json({
      success: true,
      data: requests,
    });
  } catch (error) {
    next(error);
  }
};

const getMyEventRequests = async (req, res, next) => {
  try {
    const requests = await eventRequestService.getMyEventRequests(req.user.id);

    return res.status(200).json({
      success: true,
      data: requests,
    });
  } catch (error) {
    next(error);
  }
};

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
  createEventRequest,
  getEventRequests,
  getMyEventRequests,
  getEventRequestDetail,
  reviewEventRequest,
};
