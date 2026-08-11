const express = require("express");
const { verifyToken, protect } = require("../../middlewares/auth.middleware");
const { requireClubRole } = require("../../middlewares/clubAuth.middleware");
const {
  getJoinRequestList,
  getJoinRequestDetail,
  approveJoinRequest,
  rejectJoinRequest,
} = require("../../controllers/president/joinRequestManagement.controller");

const router = express.Router();

const presidentGuard = [
  verifyToken,
  protect(["student"]),
  requireClubRole(["president"], "clubId"),
];

router.get("/:clubId/join-requests", ...presidentGuard, getJoinRequestList);
router.get("/:clubId/join-requests/:requestId", ...presidentGuard, getJoinRequestDetail);
router.patch("/:clubId/join-requests/:requestId/approve", ...presidentGuard, approveJoinRequest);
router.patch("/:clubId/join-requests/:requestId/reject", ...presidentGuard, rejectJoinRequest);

module.exports = router;
