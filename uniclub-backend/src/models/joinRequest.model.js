const mongoose = require("mongoose");
const { JOIN_REQUEST_STATUS } = require("../utils/constants");

const joinRequestSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    club_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Club",
      required: true
    },
    form_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "JoinForm",
      required: true
    },
    answers: {
      type: [String],
      required: true
    },
    status: {
      type: String,
      enum: Object.values(JOIN_REQUEST_STATUS),
      required: true,
      default: JOIN_REQUEST_STATUS.PENDING
    },
    reviewed_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    },
    review_note: {
      type: String,
      default: ""
    },
    reviewed_at: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: { createdAt: "create_at", updatedAt: false }
  }
);

joinRequestSchema.index({ user_id: 1, club_id: 1, status: 1 });
joinRequestSchema.index({ club_id: 1, status: 1 });

module.exports = mongoose.model("JoinRequest", joinRequestSchema);