const express = require("express");
const { verifyToken, protect } = require("../../middlewares/auth.middleware");
const {
  getFeedbackEvent,
  createFeedbackEvent
} = require("../../controllers/student/feedbackManagement.controller");

const router = express.Router();

router.post("/:eventId", verifyToken, protect(["student"]), createFeedbackEvent);
router.get("/:eventId", verifyToken, protect(["student"]), getFeedbackEvent);

module.exports = router;
