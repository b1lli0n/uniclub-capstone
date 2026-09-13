const express = require("express");
const eventTimelineController = require("../controllers/eventTimeline.controller");
const { verifyToken } = require("../middlewares/auth.middleware");

const router = express.Router();

router.get(
  "/:eventId/timelines",
  eventTimelineController.getEventTimelines
);

router.post(
  "/:eventId/timelines",
  verifyToken,
  eventTimelineController.createEventTimeline
);

router.patch(
  "/:eventId/timelines/:timelineId",
  verifyToken,
  eventTimelineController.updateEventTimeline
);

router.delete(
  "/:eventId/timelines/:timelineId",
  verifyToken,
  eventTimelineController.deleteEventTimeline
);

module.exports = router;