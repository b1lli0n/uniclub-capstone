const express = require("express");
const { verifyToken, protect } = require("../../middlewares/auth.middleware");
const { requireClubMember } = require("../../middlewares/clubAuth.middleware");
const {
  getLeaderboard,
  getActivePointRules,
  getMyContributionLogs,
} = require("../../controllers/member/achievementPoints.controller");

const router = express.Router();

// Middleware guard: User must be authenticated, be a student, and be an active member of the club
const memberGuard = [
  verifyToken,
  protect(["student"]),
  requireClubMember("clubId"),
];

// GET    /api/member/clubs-membership/:clubId/points/leaderboard
// -> Get the monthly points leaderboard of the club
router.get("/:clubId/points/leaderboard", ...memberGuard, getLeaderboard);

// GET    /api/member/clubs-membership/:clubId/points/rules
// -> View all active point rules in this club
router.get("/:clubId/points/rules", ...memberGuard, getActivePointRules);

// GET    /api/member/clubs-membership/:clubId/points/logs
// -> View own contribution logs in this club
router.get("/:clubId/points/logs", ...memberGuard, getMyContributionLogs);

module.exports = router;
