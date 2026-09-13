const profileService = require("../services/profile.service");

const getMyProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const data = await profileService.getMyProfile(userId);

    return res.status(200).json({
      success: true,
      message: "Get profile successfully",
      data,
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
    }
    return res.status(500).json({
      success: false,
      message: "Get profile failed",
      error: error.message,
    });
  }
};

const getUserProfileById = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const data = await profileService.getUserProfileById(userId);

    return res.status(200).json({
      success: true,
      message: "Get user profile successfully",
      data,
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
    }
    return res.status(500).json({
      success: false,
      message: "Get user profile failed",
      error: error.message,
    });
  }
};

const updateMyProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { avatar, student_code, phone, campus } = req.body;

    const profile = await profileService.updateMyProfile(userId, {
      avatar,
      student_code,
      phone,
      campus,
    });

    return res.status(200).json({
      success: true,
      message: "Update profile successfully",
      data: profile,
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
    }
    return res.status(500).json({
      success: false,
      message: "Update profile failed",
      error: error.message,
    });
  }
};

const searchUsers = async (req, res, next) => {
  try {
    const { q } = req.query;
    const currentUserId = req.user.id;

    const data = await profileService.searchUsers({
      keyword: q,
      currentUserId,
    });

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
    }
    return res.status(500).json({
      success: false,
      message: "Search users failed",
      error: error.message,
    });
  }
};

module.exports = {
  getMyProfile,
  getUserProfileById,
  updateMyProfile,
  searchUsers,
};