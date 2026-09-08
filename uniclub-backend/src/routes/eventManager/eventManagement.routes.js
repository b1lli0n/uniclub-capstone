const express = require("express");
const { verifyToken } = require("../../middlewares/auth.middleware");
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

router.get(
  "/:clubId/events/:eventId",
  verifyToken,
  requireClubRole(ALLOWED_EVENT_ROLES, "clubId"),
  getEventDetail
);
router.get(
  "/:clubId/events",
  verifyToken,
  requireClubRole(ALLOWED_EVENT_ROLES, "clubId"),
  getEvents
);
router.post(
  "/:clubId/events",
  verifyToken,
  requireClubRole(ALLOWED_EVENT_ROLES, "clubId"),
  createEvent
);
router.patch(
  "/:clubId/events/:eventId",
  verifyToken,
  requireClubRole(ALLOWED_EVENT_ROLES, "clubId"),
  updateEvent
);
router.patch(
  "/:clubId/events/:eventId/cancel",
  verifyToken,
  requireClubRole(ALLOWED_EVENT_ROLES, "clubId"),
  cancelEvent
);

module.exports = router;
