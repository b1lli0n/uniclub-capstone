const express = require("express");
const { verifyToken, protect } = require("../../middlewares/auth.middleware");
const {
  getFeedbackEvent,
  createFeedbackEvent,
  updateFeedbackEvent
} = require("../../controllers/student/feedbackManagement.controller");

const router = express.Router();

router.get("/:eventId", verifyToken, protect(["student"]), getFeedbackEvent);
router.post("/:eventId", verifyToken, protect(["student"]), createFeedbackEvent);
router.patch("/:eventId", verifyToken, protect(["student"]), updateFeedbackEvent);

module.exports = router;
