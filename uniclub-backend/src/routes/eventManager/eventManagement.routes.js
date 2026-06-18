const express = require("express");
const { verifyToken } = require("../../middlewares/auth.middleware");
const { requireClubRole } = require("../../middlewares/clubAuth.middleware");
const { getEvents } = require("../../controllers/eventManager/eventManagement.controller");

const router = express.Router();

router.get(
  "/:clubId/events",
  verifyToken,
  requireClubRole(["event_manager", "president"], "clubId"),
  getEvents
);

module.exports = router;
