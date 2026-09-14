const express = require("express");
const eventTimelineController = require("../controllers/eventTimeline.controller");
const { verifyToken, authorize } = require("../middlewares/auth.middleware");
const { requireClubRole } = require("../middlewares/club.middleware");

const router = express.Router();

// Guard for write operations: must be student + president or event_manager of the club
const timelineWriteGuard = [
  verifyToken,
  authorize(["student"]),
  requireClubRole(["president", "event_manager"], "clubId"),
];

// GET: any logged-in student can view timelines
router.get(
  "/:eventId/timelines",
  verifyToken,
  authorize(["student"]),
  eventTimelineController.getEventTimelines
);

// POST/PATCH/DELETE: only president or event_manager of the club
router.post(
  "/:eventId/timelines",
  ...timelineWriteGuard,
  eventTimelineController.createEventTimeline
);

router.patch(
  "/:eventId/timelines/:timelineId",
  ...timelineWriteGuard,
  eventTimelineController.updateEventTimeline
);

router.delete(
  "/:eventId/timelines/:timelineId",
  ...timelineWriteGuard,
  eventTimelineController.deleteEventTimeline
);

module.exports = router;