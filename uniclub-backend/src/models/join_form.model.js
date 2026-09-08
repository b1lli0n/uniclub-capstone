const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const joinFormSchema = Schema(
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
      type: [String],
      required: true,
      validate: {
        validator(value) {
          return Array.isArray(value) && value.length > 0;
        },
        message: "Form must have at least one question",
      },
    },

    status: {
      type: String,
      required: true,
      enum: ["active", "inactive"],
      default: "active",
    },

    created_by: {
      type: Schema.Types.ObjectId,
      ref: "ClubMember",
      required: true,
    },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);

joinFormSchema.index({ club_id: 1, status: 1 });

module.exports = mongoose.model("JoinForm", joinFormSchema);
