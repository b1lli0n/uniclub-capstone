const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const pollOptionSchema = new Schema(
  {
    text: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    _id: true,
  }
);

const pollVoteSchema = new Schema(
  {
    user_id: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    option_id: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    voted_at: {
      type: Date,
      required: true,
      default: Date.now,
    },
  },
  {
    _id: false,
  }
);

const pollSchema = new Schema(
  {
    club_id: {
      type: Schema.Types.ObjectId,
      ref: "Club",
      required: true,
    },
    created_by: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },
    options: {
      type: [pollOptionSchema],
      validate: {
        validator: (options) => Array.isArray(options) && options.length >= 2,
        message: "Poll must have at least 2 options",
      },
    },
    votes: {
      type: [pollVoteSchema],
      default: [],
    },
    status: {
      type: String,
      required: true,
      enum: ["open", "closed"],
      default: "open",
    },
    start_at: {
      type: Date,
      default: Date.now,
    },
    end_at: {
      type: Date,
      default: null,
    },
    closed_at: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

pollSchema.index({ club_id: 1, status: 1, createdAt: -1 });
pollSchema.index({ club_id: 1, title: "text" });

module.exports = mongoose.model("Poll", pollSchema);
