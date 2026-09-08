const express = require("express");
const { verifyToken, authorize } = require("../../middlewares/auth.middleware");
const { requireClubMember } = require("../../middlewares/club.middleware");
const {
  getClubActivitySchedule,
  getActivityScheduleDetail,
} = require("../../controllers/member/activitySchedule.controller");

const router = express.Router({ mergeParams: true });

router.get(
  "/",
  verifyToken,
  authorize(["student"]),
  requireClubMember("clubId"),
  getClubActivitySchedule
);

router.get(
  "/:activityId",
  verifyToken,
  authorize(["student"]),
  requireClubMember("clubId"),
  getActivityScheduleDetail
);

module.exports = router;
