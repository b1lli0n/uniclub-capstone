const express = require("express");
const { verifyToken, protect } = require("../../middlewares/auth.middleware");
const { requireClubRole } = require("../../middlewares/clubAuth.middleware");
const {
  getClubActivitySchedule,
  getActivityScheduleDetail,
  createActivity,
  updateActivity,
  deleteActivity,
  getActivityAttendance,
  saveActivityAttendance,
} = require("../../controllers/secretary/activitySchedule.controller");

const router = express.Router({ mergeParams: true });

const secretaryAuth = [
  verifyToken,
  protect(["student"]),
  requireClubRole(["president", "secretary"], "clubId"),
];

router.get("/", ...secretaryAuth, getClubActivitySchedule);
router.get("/:activityId", ...secretaryAuth, getActivityScheduleDetail);
router.get("/:activityId/attendance", ...secretaryAuth, getActivityAttendance);
router.post("/:activityId/attendance", ...secretaryAuth, saveActivityAttendance);
router.post("/", ...secretaryAuth, createActivity);
router.put("/:activityId", ...secretaryAuth, updateActivity);
router.delete("/:activityId", ...secretaryAuth, deleteActivity);

module.exports = router;
