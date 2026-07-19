const mongoose = require("mongoose");

const feedbackSchema = new mongoose.Schema(
  {
    event_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true
    },
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    comment: {
      type: String,
      required: true,
      trim: true
    }
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: false }
  }
);

feedbackSchema.index({ event_id: 1, user_id: 1 }, { unique: true });

module.exports = mongoose.model("Feedback", feedbackSchema);
