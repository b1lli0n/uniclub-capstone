const express = require("express");
const jwt = require("jsonwebtoken");
const env = require("../config/env");
const { verifyToken, authorize } = require("../middlewares/auth.middleware");
const {
  getPublicEvents,
  getEventDetail,
  registerForEvent,
  cancelEventRegistration,
  getMyRegistrations,
} = require("../controllers/event.controller");

const router = express.Router();
const secret = env.jwtSecret;

// Middleware optional token verification
const verifyTokenOptional = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next();
  }
  const token = authHeader.slice(7);
  try {
    const decoded = jwt.verify(token, secret);
    req.user = decoded;
  } catch (err) {
    // Ignored: request is treated as anonymous
  }
  next();
};

// 1. View Public Events
router.get("/public", verifyTokenOptional, getPublicEvents);

// 2. View My Registrations
router.get("/my-registrations", verifyToken, getMyRegistrations);

// 3. View Event Detail
router.get("/:eventId", verifyTokenOptional, getEventDetail);

// 4. Register for Event
router.post("/:eventId/register", verifyToken, authorize(["student"]), registerForEvent);

// 5. Cancel Event Registration
router.post("/:eventId/cancel", verifyToken, authorize(["student"]), cancelEventRegistration);

module.exports = router;
