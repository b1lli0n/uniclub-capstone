const express = require("express");
const studentAffairsController = require("../../controllers/studentAffairs/eventRequestManagement.controller");
const { verifyToken, authorize } = require("../../middlewares/auth.middleware");

const router = express.Router();

// Middleware guard: Student Affairs staff only
const saGuard = [
  verifyToken,
  authorize(["student_affairs"]),
];

// Student Affairs: Get all event requests (with status filtering & sorting)
router.get(
  "/",
  ...saGuard,
  studentAffairsController.getEventRequests
);

// Student Affairs: Get detail of an event request
router.get(
  "/:requestId",
  ...saGuard,
  studentAffairsController.getEventRequestDetail
);

// Student Affairs: Review an event request (Approve / Reject)
router.put(
  "/:requestId/review",
  ...saGuard,
  studentAffairsController.reviewEventRequest
);

// Backward-compatibility aliases
router.put(
  "/:requestId/approve",
  ...saGuard,
  (req, res, next) => {
    req.body = req.body || {};
    req.body.status = "approved";
    return studentAffairsController.reviewEventRequest(req, res, next);
  }
);

router.put(
  "/:requestId/reject",
  ...saGuard,
  (req, res, next) => {
    req.body = req.body || {};
    req.body.status = "rejected";
    return studentAffairsController.reviewEventRequest(req, res, next);
  }
);

module.exports = router;
