const express = require("express");
const { validate, Joi } = require("../middlewares/validate");
const { verifyToken, protect } = require("../middlewares/auth");
const authController = require("../controllers/auth.controller");

const router = express.Router();

/**
 * POST /api/v1/auth/google
 * Nhận Google ID token từ client hoặc service khác, rồi chuyển cho controller verify.
 */
router.post(
  "/google",
  validate({
    body: Joi.object({
      idToken: Joi.string().required().messages({
        "any.required": "Google ID token is required"
      })
    })
  }),
  authController.googleLogin
);

/**
 * GET /api/v1/auth/profile
 * Lấy thông tin user hiện tại, bắt buộc phải có JWT hợp lệ.
 */
router.get("/profile", verifyToken, authController.getProfile);

/**
 * GET /api/v1/auth/admin-only
 * Chỉ admin mới vào được, nên cần cả verifyToken lẫn protect(['admin']).
 */
router.get(
  "/admin-only",
  verifyToken,
  protect(["admin"]),
  authController.adminOnly
);

module.exports = router;
