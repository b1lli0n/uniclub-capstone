const express = require("express");
const { verifyToken, protect } = require("../../middlewares/auth.middleware");
const { getFeedbackEvent } = require("../../controllers/student/feedbackManagement.controller");

const router = express.Router();

router.get("/:eventId", verifyToken, protect(["student"]), getFeedbackEvent);

module.exports = router;
