const express = require("express");
const { verifyToken, authorize } = require("../../middlewares/auth.middleware");
const { requireClubRole } = require("../../middlewares/club.middleware");
const {
  getJoinRequestList,
  getJoinRequestDetail,
  reviewJoinRequest,
} = require("../../controllers/president/joinRequestManagement.controller");

const router = express.Router();

const presidentGuard = [
  verifyToken,
  authorize(["student"]),
  requireClubRole(["president"], "clubId"),
];

router.get("/:clubId/join-requests", ...presidentGuard, getJoinRequestList);
router.get("/:clubId/join-requests/:requestId", ...presidentGuard, getJoinRequestDetail);
router.patch("/:clubId/join-requests/:requestId/review", ...presidentGuard, reviewJoinRequest);

// Backward-compatibility aliases
router.patch("/:clubId/join-requests/:requestId/approve", ...presidentGuard, (req, res, next) => {
  req.body = req.body || {};
  req.body.status = "approved";
  return reviewJoinRequest(req, res, next);
});
router.patch("/:clubId/join-requests/:requestId/reject", ...presidentGuard, (req, res, next) => {
  req.body = req.body || {};
  req.body.status = "rejected";
  return reviewJoinRequest(req, res, next);
});

module.exports = router;
