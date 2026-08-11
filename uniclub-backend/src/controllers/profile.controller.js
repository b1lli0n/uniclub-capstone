const Profile = require("../models/profile.model");
const User = require("../models/user.model");
const mongoose = require("mongoose");

const getMyProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId).select(
      "full_name email avatar_url role status"
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

const updateMyProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const {
      student_code,
      phone,
      major,
      campus,
      social_links,
    } = req.body;

    const updateData = {
      student_code,
      phone,
      major,
      campus,
    };

    if (social_links) {
      updateData.social_links = {
        facebook: social_links.facebook || "",
        github: social_links.github || "",
        linkedin: social_links.linkedin || "",
      };
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
      status: "active",
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
  updateMyProfile,
  searchUsers,
};