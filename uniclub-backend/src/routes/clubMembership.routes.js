const express = require("express");
const {
  getClubJoinForm,
  submitJoinRequest
} = require("../controllers/clubMembership.controller");

const router = express.Router();

router.get("/:clubId/join-form", getClubJoinForm);
router.post("/:clubId/join-requests", submitJoinRequest);

module.exports = router;
