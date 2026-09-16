const express = require("express");
const { verifyToken, authorize } = require("../middlewares/auth.middleware");
const {
  getPublicEvents,
  getEventDetail,
  registerForEvent,
  cancelEventRegistration,
  getMyRegistrations,
} = require("../controllers/event.controller");

const router = express.Router();

// 1. View Public Events
router.get("/public", verifyToken, authorize(["student"]), getPublicEvents);

// 2. View My Registrations
router.get("/my-registrations", verifyToken, authorize(["student"]), getMyRegistrations);

// 3. View Event Detail – requires login (student only)
router.get("/:eventId", verifyToken, authorize(["student"]), getEventDetail);

// 4. Register for Event
router.post("/:eventId/register", verifyToken, authorize(["student"]), registerForEvent);

// 5. Cancel Event Registration
router.post("/:eventId/cancel", verifyToken, authorize(["student"]), cancelEventRegistration);

module.exports = router;
