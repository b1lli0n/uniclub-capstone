const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = Schema(
  {
    full_name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      trim: true,
      lowercase: true,
    },

    avatar_url: {
      type: String,
      default: "",
    },

    provider: {
      type: String,
      required: true,
      enum: ["google", "feId"],
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
      enum: ["active", "inactive", "blocked"],
      default: "active",
    },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);

userSchema.index({ email: 1 });
userSchema.index({ provider: 1, provider_id: 1 }, { unique: true });

module.exports = mongoose.model("User", userSchema);
