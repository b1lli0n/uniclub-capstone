const { OAuth2Client } = require("google-auth-library");
const { createToken } = require("../middlewares/auth");
const env = require("../config/env");
const User = require("../models/user.model");

// Service giữ toàn bộ logic nghiệp vụ của Google login.
// Controller chỉ gọi hàm này rồi trả response ra ngoài.
const googleClient = env.googleClientId
  ? new OAuth2Client(env.googleClientId)
  : null;

const getStatusError = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const mapUserResponse = (userDoc) => ({
  id: String(userDoc._id),
  full_name: userDoc.full_name,
  email: userDoc.email,
  avatar_url: userDoc.avatar_url,
  provider: userDoc.provider,
  provider_id: userDoc.provider_id,
  role: userDoc.role,
  status: userDoc.status
});

/**
 * Xử lý toàn bộ luồng Google login.
 * 1. Verify Google ID token.
 * 2. Check email domain của trường.
 * 3. Tìm user trong DB.
 * 4. Nếu chưa có thì tự tạo user mới.
 * 5. Tạo JWT của hệ thống và trả dữ liệu user.
 */
const handleGoogleLogin = async (idToken) => {
  if (!googleClient) {
    throw getStatusError("GOOGLE_CLIENT_ID is not configured", 500);
  }

  const ticket = await googleClient.verifyIdToken({
    idToken,
    audience: env.googleClientId
  });

  const payload = ticket.getPayload();

  if (!payload || !payload.email) {
    throw getStatusError("Invalid Google token payload", 400);
  }

  if (!env.universityEmailDomain) {
    throw getStatusError("UNIVERSITY_EMAIL_DOMAIN is not configured", 500);
  }

  const normalizedEmail = payload.email.trim().toLowerCase();
  const allowedDomain = env.universityEmailDomain.trim().toLowerCase();
  const emailDomain = normalizedEmail.split("@")[1] || "";

  if (emailDomain !== allowedDomain) {
    throw getStatusError(`Only ${allowedDomain} emails can sign in`, 403);
  }

  // Tìm user theo email hoặc provider_id để tránh tạo trùng khi user đã đăng nhập trước đó.
  let userDoc = await User.findOne({
    $or: [
      { email: normalizedEmail },
      { provider: "google", provider_id: payload.sub }
    ]
  });

  let isFirstLogin = false;

  // Nếu là lần đăng nhập đầu tiên thì tạo account mới ngay tại đây.
  if (!userDoc) {
    isFirstLogin = true;
    userDoc = await User.create({
      full_name: payload.name || normalizedEmail.split("@")[0],
      email: normalizedEmail,
      avatar_url: payload.picture || null,
      provider: "google",
      provider_id: payload.sub,
      role: "student",
      status: "active"
    });
  }

  const user = mapUserResponse(userDoc);

  // JWT này là token nội bộ của UniClub để dùng cho các API protected.
  const token = createToken({
    id: user.id,
    email: user.email,
    role: user.role,
    provider: user.provider
  });

  return {
    token,
    user,
    isFirstLogin
  };
};

module.exports = {
  handleGoogleLogin
};