const mongoose = require("mongoose");
const Schema = mongoose.Schema

// Schema lưu user đăng nhập từ nhiều nhà cung cấp, ví dụ Google và FEID.
const userSchema = Schema(
  {
    full_name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: false,
      trim: true,
      lowercase: true,
      unique: true,
      sparse: true,
    },

    avatar_url: {
      type: String,
      required: false,
      default: null,
    },

    provider: {
      type: String,
      required: true,
      enum: ["google", "feid"],
    },

    provider_id: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      required: true,
      enum: ["student", "student_affairs"],
      default: "student",
    },

    status: {
      type: String,
      required: false,
      enum: ["active", "inactive", "blocked"],
      default: "active",
    },
  },
  {
    timestamps: true
  }
);

// Một user chỉ được gắn duy nhất với một provider_id theo từng provider.
userSchema.index({ provider: 1, provider_id: 1 }, { unique: true });

module.exports = mongoose.model("User", userSchema);
