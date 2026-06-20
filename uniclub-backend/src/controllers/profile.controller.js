const Profile = require("../models/profile.model");
const User = require("../models/user.model");

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

module.exports = {
  getMyProfile,
  updateMyProfile,
};