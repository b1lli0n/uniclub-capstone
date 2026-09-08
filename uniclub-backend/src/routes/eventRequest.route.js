const express = require("express");
const eventRequestController = require("../controllers/eventRequest.controller");
const { verifyToken, authorize } = require("../middlewares/auth.middleware");
const { requireClubRole } = require("../middlewares/club.middleware");

const router = express.Router();

// Event Manager: Create a new event request
router.post(
  "/:clubId",
  verifyToken,
  requireClubRole(["event_manager", "president", "leader", "club_president", "club_vice_president"], "clubId"),
  eventRequestController.createEventRequest
);

// Admin: Get all event requests
router.get(
  "/",
  verifyToken,
  authorize(["student_affairs"]),
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
  authorize(["student_affairs"]),
  eventRequestController.getEventRequestDetail
);

// Admin: Review an event request (Approve / Reject)
router.put(
  "/:requestId/review",
  verifyToken,
  authorize(["student_affairs"]),
  eventRequestController.reviewEventRequest
);

// Backward-compatibility aliases
router.put(
  "/:requestId/approve",
  verifyToken,
  authorize(["student_affairs"]),
  (req, res, next) => {
    req.body = req.body || {};
    req.body.status = "approved";
    return eventRequestController.reviewEventRequest(req, res, next);
  }
);

router.put(
  "/:requestId/reject",
  verifyToken,
  authorize(["student_affairs"]),
  (req, res, next) => {
    req.body = req.body || {};
    req.body.status = "rejected";
    return eventRequestController.reviewEventRequest(req, res, next);
  }
);

module.exports = router;
