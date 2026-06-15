const express = require("express");
const {
  getClubJoinForm,
  submitJoinRequest,
  getMyJoinRequests,
  getJoinRequestDetail,
  cancelJoinRequest
} = require("../controllers/clubMembership.controller");

const router = express.Router();

router.get("/join-requests", getMyJoinRequests);
router.patch("/join-requests/:requestId/cancel", cancelJoinRequest);
router.get("/join-requests/:requestId", getJoinRequestDetail);
router.get("/:clubId/join-form", getClubJoinForm);
router.post("/:clubId/join-requests", submitJoinRequest);

module.exports = router;
