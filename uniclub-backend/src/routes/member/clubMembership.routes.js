const express = require("express");
const { getMyClubs } = require("../../controllers/member/clubMembership.controller");

const router = express.Router();

router.get("/my-clubs", getMyClubs);

module.exports = router;
