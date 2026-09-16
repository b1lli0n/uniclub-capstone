const express = require("express");
const eventRequestController = require("../../controllers/eventManager/eventRequest.controller");
const { verifyToken, authorize } = require("../../middlewares/auth.middleware");
const { requireClubRole } = require("../../middlewares/club.middleware");

const router = express.Router();

// Event Manager / President: Create a new event creation request
router.post(
  "/:clubId",
  verifyToken,
  authorize(["student"]),
  requireClubRole(["event_manager", "president"], "clubId"),
  eventRequestController.createEventRequest
);

// Event Manager / President: Get own event creation requests
router.get(
  "/my-requests",
  verifyToken,
  authorize(["student"]),
  eventRequestController.getMyEventRequests
);

module.exports = router;
