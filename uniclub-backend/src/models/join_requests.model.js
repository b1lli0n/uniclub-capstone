const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const joinRequestSchema = new Schema(
  {
    club_id: {
      type: Schema.Types.ObjectId,
      ref: "Club",
      required: true,
    },

    form_id: {
      type: Schema.Types.ObjectId,
      ref: "JoinForm",
      required: true,
    },

    answers: {
      type: Array,
      required: true,
      default: [],
    },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "canceled"],
      required: true,
      default: "pending",
    },

    reviewed_by: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    review_note: {
      type: String,
      required: true,
      trim: true,
    },

    reviewed_at: {
      type: Date,
      required: true,
    },

    create_at: {
      type: Date,
      required: true,
      default: Date.now,
    },
  }
);

module.exports = mongoose.model("JoinRequest", joinRequestSchema);