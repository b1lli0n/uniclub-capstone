const express = require("express");
const { verifyToken, authorize } = require("../../middlewares/auth.middleware");
const { requireClubRole } = require("../../middlewares/club.middleware");
const {
  getEvents,
  getEventDetail,
  createEvent,
  updateEvent,
  cancelEvent,
} = require("../../controllers/eventManager/eventManagement.controller");

const router = express.Router();

const ALLOWED_EVENT_ROLES = ["president", "leader", "event_manager"];

const eventManagerGuard = [
  verifyToken,
  authorize(["student"]),
  requireClubRole(ALLOWED_EVENT_ROLES, "clubId"),
];

router.get(
  "/:clubId/events",
  ...eventManagerGuard,
  getEvents
);
router.get(
  "/:clubId/events/:eventId",
  ...eventManagerGuard,
  getEventDetail
);
router.post(
  "/:clubId/events",
  ...eventManagerGuard,
  createEvent
);
router.patch(
  "/:clubId/events/:eventId",
  ...eventManagerGuard,
  updateEvent
);
router.patch(
  "/:clubId/events/:eventId/cancel",
  ...eventManagerGuard,
  cancelEvent
);

module.exports = router;
