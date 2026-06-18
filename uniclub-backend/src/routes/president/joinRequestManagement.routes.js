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

router.get(
  "/:clubId/join-requests",
  verifyToken,
  protect(["student"]),
  requireClubRole(["president"], "clubId"),
  getJoinRequestList
);
router.get(
  "/:clubId/join-requests/:requestId",
  verifyToken,
  protect(["student"]),
  requireClubRole(["president"], "clubId"),
  getJoinRequestDetail
);
router.patch(
  "/:clubId/join-requests/:requestId/approve",
  verifyToken,
  protect(["student"]),
  requireClubRole(["president"], "clubId"),
  approveJoinRequest
);
router.patch(
  "/:clubId/join-requests/:requestId/reject",
  verifyToken,
  protect(["student"]),
  requireClubRole(["president"], "clubId"),
  rejectJoinRequest
);

module.exports = router;
