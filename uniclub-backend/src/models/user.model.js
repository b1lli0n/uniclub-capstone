const mongoose = require("mongoose");
const { USER_ROLE, USER_STATUS, PROVIDER } = require("../utils/constants");

const userSchema = new mongoose.Schema(
  {
    full_name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      trim: true,
      lowercase: true
    },
    avatar_url: {
      type: String,
      default: ""
    },
    provider: {
      type: String,
      enum: Object.values(PROVIDER),
      required: true
    },
    provider_id: {
      type: String,
      required: true
    },
    role: {
      type: String,
      enum: Object.values(USER_ROLE),
      required: true
    },
    status: {
      type: String,
      enum: Object.values(USER_STATUS),
      default: USER_STATUS.ACTIVE
    }
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" }
  }
);
userSchema.index({ email: 1 });
userSchema.index({ provider: 1, provider_id: 1 }, { unique: true });
module.exports = mongoose.model("User", userSchema);