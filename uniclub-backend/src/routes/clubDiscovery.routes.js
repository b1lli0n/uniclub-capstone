const express = require("express");
const clubDiscoveryController = require("../controllers/clubDiscovery.controller");
const { authorize, verifyToken } = require("../middlewares/auth.middleware");

const router = express.Router();

router.get("/",verifyToken,authorize(["student"]),clubDiscoveryController.getAllClubs
);
router.get("/:id",verifyToken,authorize(["student"]),clubDiscoveryController.getClubById
);
router.post("/creation-requests",verifyToken,authorize(["student"]),clubDiscoveryController.requestCreateClub
);

module.exports = router;