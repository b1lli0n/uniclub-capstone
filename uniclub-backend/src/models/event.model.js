const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema(
  {
    club_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Club",
      required: true
    },
    created_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
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
    content: {
      type: String,
      required: true,
      trim: true
    },
    category: {
      type: String,
      required: true,
      trim: true
    },
    start_time: {
      type: Date,
      required: true
    },
    end_time: {
      type: Date,
      required: true
    },
    location: {
      type: String,
      required: true,
      trim: true
    },
    is_public: {
      type: Boolean,
      required: true,
      default: true
    },
    capacity: {
      type: Number,
      required: true
    },
    multiplier: {
      type: Number,
      required: true,
      default: 1
    },
    status: {
      type: String,
      enum: ["coming soon", "opening", "closed", "cancelled"],
      required: true,
      default: "coming soon"
    },
    progress_status: {
      type: String,
      enum: ["draft", "completed"],
      required: true,
      default: "draft"
    },
    check_in_status: {
      type: String,
      enum: ["not_open", "open", "closed"],
      required: true,
      default: "not_open"
    },
    media_uris: {
      type: [String],
      default: []
    },
    feedback_summary: {
      type: [String],
      default: []
    }
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" }
  }
);

eventSchema.index({ club_id: 1, start_time: -1 });

module.exports = mongoose.model("Event", eventSchema);
