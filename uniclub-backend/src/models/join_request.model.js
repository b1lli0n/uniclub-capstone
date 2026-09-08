const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const joinRequestSchema = Schema(
  {
    user_id: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

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
      type: [String],
      required: true,
    },

    status: {
      type: String,
      required: true,
      enum: ["pending", "approved", "rejected", "cancelled"],
      default: "pending",
    },

    reviewed_by: {
      type: Schema.Types.ObjectId,
      ref: "ClubMember",
      default: null,
    },

    review_note: {
      type: String,
      default: "",
    },

    reviewed_at: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);

joinRequestSchema.index({ user_id: 1, club_id: 1, status: 1 });
joinRequestSchema.index({ club_id: 1, status: 1 });

module.exports = mongoose.model("JoinRequest", joinRequestSchema);
