const Profile = require("../models/profile.model");
const User = require("../models/user.model");
const mongoose = require("mongoose");

const getMyProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId).select(
      "full_name email avatar_url role"
    );

    let profile = await Profile.findOne({ user_id: userId });

    if (!profile) {
      profile = await Profile.create({
        user_id: userId,
      });
    }

    res.status(200).json({
      success: true,
      message: "Get profile successfully",
      data: {
        user,
        profile,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Get profile failed",
      error: error.message,
    });
  }
};

const getUserProfileById = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!mongoose.isValidObjectId(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }

    const user = await User.findById(userId).select(
      "full_name email avatar_url role"
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    let profile = await Profile.findOne({ user_id: userId });

    if (!profile) {
      profile = await Profile.create({
        user_id: userId,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Get user profile successfully",
      data: {
        user,
        profile,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Get user profile failed",
      error: error.message,
    });
  }
};

const updateMyProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const {
      avatar,
      student_code,
      phone,
      campus,
    } = req.body;

    let existingProfile = await Profile.findOne({ user_id: userId });

    if (
      existingProfile &&
      existingProfile.student_code &&
      student_code &&
      student_code.trim() !== existingProfile.student_code
    ) {
      return res.status(400).json({
        success: false,
        message: "Student code (MSSV) cannot be changed once set",
      });
    }

    const updateData = {
      phone,
      campus,
    };

    if (avatar !== undefined) {
      updateData.avatar = avatar;
    }

    if (student_code && (!existingProfile || !existingProfile.student_code)) {
      updateData.student_code = student_code;
    }

    const profile = await Profile.findOneAndUpdate(
      { user_id: userId },
      updateData,
      {
        new: true,
        upsert: true,
        runValidators: true,
      }
    );

    res.status(200).json({
      success: true,
      message: "Update profile successfully",
      data: profile,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Update profile failed",
      error: error.message,
    });
  }
};

const searchUsers = async (req, res) => {
  try {
    const { q } = req.query;
    const currentUserId = req.user.id;

    const queryFilter = {
      _id: { $ne: new mongoose.Types.ObjectId(currentUserId) },
      role: "student",
    };

    if (q && q.trim().length >= 1) {
      const keyword = q.trim();
      queryFilter.$or = [
        { full_name: { $regex: keyword, $options: "i" } },
        { email: { $regex: keyword, $options: "i" } },
      ];
    }

    const users = await User.find(queryFilter)
      .select("_id full_name email avatar_url")
      .limit(10);

    return res.status(200).json({
      success: true,
      data: users.map((u) => ({
        value: u._id,
        label: `${u.full_name} (${u.email})`,
        name: u.full_name,
        email: u.email,
        avatarUrl: u.avatar_url || "",
      })),
    });
  } catch (error) {
    res.status(500).json({
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