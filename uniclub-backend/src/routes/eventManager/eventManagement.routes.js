const express = require("express");
const { verifyToken } = require("../../middlewares/auth.middleware");
const { requireClubRole } = require("../../middlewares/clubAuth.middleware");
const {
  getEvents,
  getEventDetail,
  createEvent,
  updateEvent,
  cancelEvent,
} = require("../../controllers/eventManager/eventManagement.controller");

const router = express.Router();

router.get(
  "/:clubId/events/:eventId",
  verifyToken,
  requireClubRole(["event_manager"], "clubId"),
  getEventDetail
);
router.get(
  "/:clubId/events",
  verifyToken,
  requireClubRole(["event_manager"], "clubId"),
  getEvents
);
router.post(
  "/:clubId/events",
  verifyToken,
  requireClubRole(["event_manager"], "clubId"),
  createEvent
);
router.patch(
  "/:clubId/events/:eventId",
  verifyToken,
  requireClubRole(["event_manager"], "clubId"),
  updateEvent
);
router.patch(
  "/:clubId/events/:eventId/cancel",
  verifyToken,
  requireClubRole(["event_manager"], "clubId"),
  cancelEvent
);

module.exports = router;
