const express = require("express");
const eventRequestController = require("../controllers/eventRequest.controller");
const { verifyToken, protect } = require("../middlewares/auth.middleware");
const { requireClubRole } = require("../middlewares/clubAuth.middleware");

const router = express.Router();

// Event Manager: Create a new event request
router.post(
  "/:clubId",
  verifyToken,
  requireClubRole(["event_manager", "club_president", "club_vice_president"], "clubId"),
  eventRequestController.createEventRequest
);

// Admin: Get all event requests
router.get(
  "/",
  verifyToken,
  protect(["student_affairs"]),
  eventRequestController.getEventRequests
);

// User: Get my own event creation requests
router.get(
  "/my-requests",
  verifyToken,
  eventRequestController.getMyEventRequests
);

// Admin: Get detail of an event request
router.get(
  "/:requestId",
  verifyToken,
  protect(["student_affairs"]),
  eventRequestController.getEventRequestDetail
);

// Admin: Approve an event request
router.put(
  "/:requestId/approve",
  verifyToken,
  protect(["student_affairs"]),
  eventRequestController.approveEventRequest
);

// Admin: Reject an event request
router.put(
  "/:requestId/reject",
  verifyToken,
  protect(["student_affairs"]),
  eventRequestController.rejectEventRequest
);

module.exports = router;
