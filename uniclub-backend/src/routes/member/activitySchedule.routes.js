const express = require("express");
const { verifyToken, protect } = require("../../middlewares/auth.middleware");
const { requireClubMember } = require("../../middlewares/clubAuth.middleware");
const {
  getClubActivitySchedule,
  getActivityScheduleDetail,
} = require("../../controllers/member/activitySchedule.controller");

const router = express.Router({ mergeParams: true });

router.get(
  "/",
  verifyToken,
  protect(["student"]),
  requireClubMember("clubId"),
  getClubActivitySchedule
);

router.get(
  "/:activityId",
  verifyToken,
  protect(["student"]),
  requireClubMember("clubId"),
  getActivityScheduleDetail
);

module.exports = router;
