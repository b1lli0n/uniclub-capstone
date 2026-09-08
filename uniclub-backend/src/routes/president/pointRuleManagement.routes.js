const express = require("express");
const { verifyToken, authorize } = require("../../middlewares/auth.middleware");
const { requireClubRole } = require("../../middlewares/club.middleware");
const {
  getPointRules,
  createPointRule,
  updatePointRule,
  togglePointRuleStatus,
  awardPoints,
  getActionTypes,
} = require("../../controllers/president/pointRuleManagement.controller");

const router = express.Router();

// GET /api/president/clubs/action-types
router.get("/action-types", verifyToken, getActionTypes);

// Middleware guard: User must be authenticated, be a student, and have the president role in the club
const presidentGuard = [
  verifyToken,
  authorize(["student"]),
  requireClubRole(["president"], "clubId"),
];

// GET    /api/president/clubs/:clubId/point-rules
// -> View all point rules (active and inactive) for management
router.get("/:clubId/point-rules", ...presidentGuard, getPointRules);

// POST   /api/president/clubs/:clubId/point-rules
// -> Create a new point rule
router.post("/:clubId/point-rules", ...presidentGuard, createPointRule);

// PATCH  /api/president/clubs/:clubId/point-rules/:ruleId
// -> Update point rule values (reward_point, limits)
router.patch("/:clubId/point-rules/:ruleId", ...presidentGuard, updatePointRule);

// PATCH  /api/president/clubs/:clubId/point-rules/:ruleId/status
// -> Activate/deactivate a point rule
router.patch("/:clubId/point-rules/:ruleId/status", ...presidentGuard, togglePointRuleStatus);

// POST   /api/president/clubs/:clubId/members/:memberId/points
// -> Manually award/deduct points to a club member
router.post("/:clubId/members/:memberId/points", ...presidentGuard, awardPoints);

module.exports = router;
