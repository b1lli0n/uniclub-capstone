const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const joinFormSchema = new Schema(
  {
    club_id: {
      type: Schema.Types.ObjectId,
      ref: "Club",
      required: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    questions: {
      type: Array,
      required: true,
      default: [],
    },

    status: {
      type: String,
      enum: ["active", "inactive"],
      required: true,
      default: "active",
    },

    created_by: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "update_at",
    },
  }
);

module.exports = mongoose.model("JoinForm", joinFormSchema);