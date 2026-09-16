const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const clubCreationRequestSchema = new Schema({
  club_name: {
    type: String,
    required: true,
    trim: true,
  },

  description: {
    type: String,
    required: false,
    trim: true,
  },

  slogan: {
    type: String,
    required: false,
    trim: true,
    default: "",
  },

  category: {
    type: String,
    required: false,
    trim: true,
    enum: ["Arts", "Sports", "Academic", "Event", "Other"],
    default: "Academic",
  },

  reason: {
    type: String,
    required: true,
    trim: true,
  },

  logo_url: {
    type: String,
    required: true,
    trim: true,
  },

  category: {
    type: String,
    required: false,
    trim: true,
    enum: ["Arts", "Sports", "Academic", "Event", "Other"],
    default: "Other",
  },

  status: {
    type: String,
    enum: ["waiting_member_approval", "pending", "approved", "rejected", "expired"],
    required: true,
    default: "waiting_member_approval",
  },

  expires_at: {
    type: Date,
    required: false,
  },

  requested_by: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  members: [
    {
      user_id: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      status: {
        type: String,
        enum: ["pending", "accepted", "rejected"],
        default: "pending",
      },
      responded_at: {
        type: Date,
        default: null,
      },
    },
  ],

  member_ids: [
    {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  ],

  reviewed_by: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: false,
  },

  review_note: {
    type: String,
    required: false,
    trim: true,
  },

  reviewed_at: {
    type: Date,
    required: false,
  },

  created_at: {
    type: Date,
    required: true,
    default: Date.now,
  },
});

module.exports = mongoose.model(
  "ClubCreationRequest",
  clubCreationRequestSchema
);