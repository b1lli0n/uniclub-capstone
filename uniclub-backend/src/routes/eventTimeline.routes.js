const express = require("express");
const eventTimelineController = require("../controllers/eventTimeline.controller");
const { verifyToken, authorize } = require("../middlewares/auth.middleware");

const router = express.Router();

// Guard for write operations: must be authenticated student
// Permission (club role check) is handled inside the service layer via checkTimelineManagePermission
const timelineWriteGuard = [
  verifyToken,
  authorize(["student"]),
];

// GET: any logged-in student can view timelines
router.get(
  "/:eventId/timelines",
  verifyToken,
  authorize(["student"]),
  eventTimelineController.getEventTimelines
);

// POST/PATCH/DELETE: only president or event_manager of the club (enforced in service)
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