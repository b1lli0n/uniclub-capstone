const mongoose = require("mongoose");
const profileSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true
    },
    student_code: {
      type: String,
      trim: true
    },
    phone: {
      type: Number
    },
    major: {
      type: String,
      trim: true
    },
    campus: {
      type: String,
      trim: true
    },
    social_links: {
      type: String,
      default: ""
    },
    updated_at: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: false
  }
);
module.exports = mongoose.model("Profile", profileSchema);