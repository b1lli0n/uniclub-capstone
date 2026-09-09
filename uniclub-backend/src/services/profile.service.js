const mongoose = require("mongoose");
const Profile = require("../models/profile.model");
const User = require("../models/user.model");
const { getStatusError } = require("../utils/error");

const getMyProfile = async (userId) => {
  const user = await User.findById(userId).select(
    "full_name email avatar_url role"
  );

  let profile = await Profile.findOne({ user_id: userId });

  if (!profile) {
    profile = await Profile.create({
      user_id: userId,
    });
  }

  return {
    user,
    profile,
  };
};

const getUserProfileById = async (userId) => {
  if (!mongoose.isValidObjectId(userId)) {
    throw getStatusError("Invalid user ID", 400);
  }

  const user = await User.findById(userId).select(
    "full_name email avatar_url role"
  );

  if (!user) {
    throw getStatusError("User not found", 404);
  }

  let profile = await Profile.findOne({ user_id: userId });

  if (!profile) {
    profile = await Profile.create({
      user_id: userId,
    });
  }

  return {
    user,
    profile,
  };
};

const updateMyProfile = async (userId, { avatar, student_code, phone, campus }) => {
  const existingProfile = await Profile.findOne({ user_id: userId });

  if (
    existingProfile &&
    existingProfile.student_code &&
    student_code &&
    student_code.trim() !== existingProfile.student_code
  ) {
    throw getStatusError("Student code (MSSV) cannot be changed once set", 400);
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

  return profile;
};

const searchUsers = async ({ keyword, currentUserId }) => {
  const queryFilter = {
    _id: { $ne: new mongoose.Types.ObjectId(currentUserId) },
    role: "student",
  };

  if (keyword && keyword.trim().length >= 1) {
    const cleanKeyword = keyword.trim();
    queryFilter.$or = [
      { full_name: { $regex: cleanKeyword, $options: "i" } },
      { email: { $regex: cleanKeyword, $options: "i" } },
    ];
  }

  const users = await User.find(queryFilter)
    .select("_id full_name email avatar_url")
    .limit(10);

  return users.map((u) => ({
    value: u._id,
    label: `${u.full_name} (${u.email})`,
    name: u.full_name,
    email: u.email,
    avatarUrl: u.avatar_url || "",
  }));
};

module.exports = {
  getMyProfile,
  getUserProfileById,
  updateMyProfile,
  searchUsers,
};
