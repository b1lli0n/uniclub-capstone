const express = require("express");
const { verifyToken, authorize } = require("../../middlewares/auth.middleware");
const { requireClubRole } = require("../../middlewares/club.middleware");
const {
  getJoinForm,
  createJoinForm,
  updateJoinForm,
  toggleJoinFormStatus,
} = require("../../controllers/president/joinFormManagement.controller");

const router = express.Router();

// Middleware chung cho tất cả routes: phải login + là student + là president của club
const presidentGuard = [
  verifyToken,
  authorize(["student"]),
  requireClubRole(["president"], "clubId"),
];

// GET    /api/president/clubs/:clubId/join-form
// → Xem form hiện tại của club
router.get("/:clubId/join-form", ...presidentGuard, getJoinForm);

// POST   /api/president/clubs/:clubId/join-form
// → Tạo form mới (tự động deactivate form cũ)
// Body: { title, description, questions: string[] }
router.post("/:clubId/join-form", ...presidentGuard, createJoinForm);

// PATCH  /api/president/clubs/:clubId/join-form/:formId
// → Cập nhật nội dung form (title / description / questions)
// Body: { title?, description?, questions? }
router.patch("/:clubId/join-form/:formId", ...presidentGuard, updateJoinForm);

// PATCH  /api/president/clubs/:clubId/join-form/:formId/status
// → Bật/tắt form
// Body: { status: "active" | "inactive" }
router.patch("/:clubId/join-form/:formId/status", ...presidentGuard, toggleJoinFormStatus);

module.exports = router;
