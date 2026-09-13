const express = require("express");
const { verifyToken, authorize } = require("../../middlewares/auth.middleware");
const {
  getFeedbackEvent,
  createFeedbackEvent,
  updateFeedbackEvent,
  deleteFeedbackEvent
} = require("../../controllers/student/feedbackManagement.controller");

const router = express.Router();

router.get("/:eventId", verifyToken, authorize(["student"]), getFeedbackEvent);
router.post("/:eventId", verifyToken, authorize(["student"]), createFeedbackEvent);
router.patch("/:eventId", verifyToken, authorize(["student"]), updateFeedbackEvent);
router.delete("/:eventId", verifyToken, authorize(["student"]), deleteFeedbackEvent);

module.exports = router;
