const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const rewardSchema = Schema(
  {
    club_id: {
      type: Schema.Types.ObjectId,
      ref: "Club",
      required: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
      default: "",
    },

    image_url: {
      type: String,
      required: false,
      trim: true,
      default: "",
    },

    points_required: {
      type: Number,
      required: false,
    },

    quantity: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },

    status: {
      type: String,
      required: true,
      enum: ["active", "hidden"],
      default: "active",
    },

    created_by: {
      type: Schema.Types.ObjectId,
      ref: "ClubMember",
      required: false,
    },
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  }
);

rewardSchema.index({ club_id: 1 });
rewardSchema.index({ club_id: 1, status: 1 });
rewardSchema.index({ club_id: 1, created_at: -1 });
rewardSchema.index({ club_id: 1, name: 1 });

module.exports = mongoose.model("Reward", rewardSchema);
