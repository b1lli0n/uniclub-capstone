const express = require("express");
const { verifyToken } = require("../../middlewares/auth.middleware");
const { requireClubRole } = require("../../middlewares/clubAuth.middleware");
const { getEvents, getEventDetail } = require("../../controllers/eventManager/eventManagement.controller");

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

module.exports = router;
