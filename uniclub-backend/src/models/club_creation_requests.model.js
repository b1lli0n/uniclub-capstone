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

  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    required: true,
    default: "pending",
  },

  requested_by: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

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