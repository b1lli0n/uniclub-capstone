const express = require("express");
const {
  getClubJoinForm,
  submitJoinRequest,
  getMyJoinRequests,
  getJoinRequestDetail
} = require("../controllers/clubMembership.controller");

const router = express.Router();

router.get("/join-requests", getMyJoinRequests);
router.get("/join-requests/:requestId", getJoinRequestDetail);
router.get("/:clubId/join-form", getClubJoinForm);
router.post("/:clubId/join-requests", submitJoinRequest);

module.exports = router;
