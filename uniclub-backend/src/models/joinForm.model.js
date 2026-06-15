const mongoose = require("mongoose");
const { JOIN_FORM_STATUS } = require("../utils/constants");

const joinFormSchema = new mongoose.Schema(
  {
    club_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Club",
      required: true
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      required: true,
      trim: true
    },
    questions: {
      type: [String],
      required: true,
      validate: {
        validator(value) {
          return Array.isArray(value) && value.length > 0;
        },
        message: "Form must have at least one question"
      }
    },
    status: {
      type: String,
      enum: Object.values(JOIN_FORM_STATUS),
      required: true,
      default: JOIN_FORM_STATUS.ACTIVE
    },
    created_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    }
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "update_at" }
  }
);

joinFormSchema.index({ club_id: 1, status: 1 });

module.exports = mongoose.model("JoinForm", joinFormSchema);
