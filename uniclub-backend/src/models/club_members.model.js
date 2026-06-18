const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const clubMemberSchema = new Schema(
  {
    club_id: {
      type: Schema.Types.ObjectId,
      ref: "Club",
      required: true,
    },

    user_id: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    role: {
      type: String,
      enum: ["member", "president", "secretary", "treasurer", "event_manager"],
      required: true,
      default: "member",
    },

    status: {
      type: String,
      enum: ["active", "left", "removed"],
      required: true,
      default: "active",
    },

    joined_at: {
      type: Date,
      required: true,
      default: Date.now,
    },

    left_at: {
      type: Date,
      required: false,
      default: null,
    },
  }
);

clubMemberSchema.index({ club_id: 1, user_id: 1 }, { unique: true });

module.exports = mongoose.model("ClubMember", clubMemberSchema);