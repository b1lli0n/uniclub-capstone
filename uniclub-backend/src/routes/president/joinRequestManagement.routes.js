const express = require("express");
const {
  getJoinRequestList,
  getJoinRequestDetail
} = require("../../controllers/president/joinRequestManagement.controller");

const router = express.Router();

router.get("/:clubId/join-requests", getJoinRequestList);
router.get("/:clubId/join-requests/:requestId", getJoinRequestDetail);
module.exports = router;
