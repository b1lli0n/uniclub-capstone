const express = require("express");
const {
  getJoinRequestList,
  getJoinRequestDetail,
  approveJoinRequest,
  rejectJoinRequest
} = require("../../controllers/president/joinRequestManagement.controller");

const router = express.Router();

router.get("/:clubId/join-requests", getJoinRequestList);
router.get("/:clubId/join-requests/:requestId", getJoinRequestDetail);
router.patch("/:clubId/join-requests/:requestId/approve", approveJoinRequest);
router.patch("/:clubId/join-requests/:requestId/reject", rejectJoinRequest);

module.exports = router;
