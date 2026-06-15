const express = require("express");
const {
  getJoinRequestList
} = require("../../controllers/president/joinRequestManagement.controller");

const router = express.Router();

router.get("/:clubId/join-requests", getJoinRequestList);

module.exports = router;
