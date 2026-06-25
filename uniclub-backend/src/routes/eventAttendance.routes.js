const express = require("express");
const eventAttendanceController = require("../controllers/eventAttendance.controller");
const { verifyToken } = require("../middlewares/auth.middleware");

const router = express.Router();

// GET   /api/events/:eventId/attendance
// PATCH /api/events/:eventId/attendance/status
// POST  /api/events/:eventId/attendance/auto-absent

router.get(
  "/:eventId/attendance",
  verifyToken,
  eventAttendanceController.getAttendanceList
);

router.patch(
  "/:eventId/attendance/status",
  verifyToken,
  eventAttendanceController.updateAttendanceStatus
);

router.post(
  "/:eventId/attendance/auto-absent",
  verifyToken,
  eventAttendanceController.autoMarkAbsentAfterEventEnd
);

module.exports = router;