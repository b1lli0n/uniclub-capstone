const { createToken } = require("../middlewares/auth");
const authService = require("../services/auth.service");

/**
 * Login demo bằng email/password.
 * Hiện tại route này chỉ tạo user giả để test luồng JWT nội bộ.
 */
const login = (req, res) => {
  const { email, password } = req.body;

  // Ở bản demo thì chưa query DB, chỉ suy ra role từ email để minh họa.
  const user = {
    id: "123",
    email: email,
    role: email.includes("admin") ? "admin" : "student"
  };

  const token = createToken({
    id: user.id,
    email: user.email,
    role: user.role
  });

  res.status(200).json({
    success: true,
    message: "Login successful",
    data: {
      token,
      user
    }
  });
};


/**
 * Route test quyền admin.
 * Chỉ vào được khi middleware auth đã giải mã JWT và role là admin.
 */
const adminOnly = (req, res) => {
  res.status(200).json({
    success: true,
    message: "Admin access granted",
    user: req.user
  });
};

/**
 * Route test xác thực người dùng đã đăng nhập.
 * req.user được gắn vào bởi middleware verifyToken.
 */
const getProfile = (req, res) => {
  res.status(200).json({
    success: true,
    message: "Profile retrieved",
    user: req.user
  });
};

module.exports = {
  login,
  googleLogin,
  adminOnly,
  getProfile
};
