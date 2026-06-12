const express = require("express");
const { getHealth } = require("../controllers/health.controller");
const { getDemo } = require("../controllers/demo.controller");

const router = express.Router();

router.get("/health", getHealth);
router.get("/demo", getDemo);

module.exports = router;
