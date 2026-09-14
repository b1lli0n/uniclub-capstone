const express = require("express");
const eventAttendanceController = require("../controllers/eventAttendance.controller");
const { verifyToken, authorize } = require("../middlewares/auth.middleware");
const { requireClubRole } = require("../middlewares/club.middleware");

const router = express.Router();

// Only event_manager or president of the club can manage attendance
const attendanceGuard = [
  verifyToken,
  authorize(["student"]),
  requireClubRole(["president", "event_manager"], "clubId"),
];

// GET   /api/events/:eventId/attendance
// PATCH /api/events/:eventId/attendance/status
// POST  /api/events/:eventId/attendance/auto-absent

router.get(
  "/:eventId/attendance",
  ...attendanceGuard,
  eventAttendanceController.getAttendanceList
);

router.patch(
  "/:eventId/attendance/status",
  ...attendanceGuard,
  eventAttendanceController.updateAttendanceStatus
);

router.post(
  "/:eventId/attendance/auto-absent",
  ...attendanceGuard,
  eventAttendanceController.autoMarkAbsentAfterEventEnd
);

module.exports = router;