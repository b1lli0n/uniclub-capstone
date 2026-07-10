const express = require("express");
const clubDiscoveryController = require("../controllers/clubDiscovery.controller");
const { protect, verifyToken } = require("../middlewares/auth.middleware");

const router = express.Router();

router.get("/",verifyToken,protect(["student"]),clubDiscoveryController.getAllClubs
);
router.get("/:id",verifyToken,protect(["student"]),clubDiscoveryController.getClubById
);
router.post("/creation-requests",verifyToken,protect(["student"]),clubDiscoveryController.requestCreateClub
);

module.exports = router;