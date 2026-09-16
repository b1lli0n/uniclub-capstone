const eventRequestService = require("../../services/eventRequest.service");

// Event Manager / President: Create a new event creation request
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

// Event Manager / President: Get own event creation requests
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

module.exports = {
  createEventRequest,
  getMyEventRequests,
};
