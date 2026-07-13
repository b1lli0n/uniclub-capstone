const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const rewardRedemptionSchema = Schema(
  {
    club_id: {
      type: Schema.Types.ObjectId,
      ref: "Club",
      required: true,
    },

    reward_id: {
      type: Schema.Types.ObjectId,
      ref: "Reward",
      required: true,
    },

    membership_id: {
      type: Schema.Types.ObjectId,
      ref: "ClubMember",
      required: true,
    },

    quantity: {
      type: Number,
      required: true,
      min: 1,
      default: 1,
    },

    point_cost: {
      type: Number,
      required: true,
      min: 1,
    },

    total_point: {
      type: Number,
      required: true,
      min: 1,
    },

    status: {
      type: String,
      required: true,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },

    rejection_reason: {
      type: String,
      required: false,
      trim: true,
      default: "",
    },

    reviewed_by: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: false,
      default: null,
    },

    reviewed_at: {
      type: Date,
      required: false,
      default: null,
    },
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  }
);

rewardRedemptionSchema.index({
  club_id: 1,
  status: 1,
  created_at: -1,
});

rewardRedemptionSchema.index({
  membership_id: 1,
  created_at: -1,
});

rewardRedemptionSchema.index({
  reward_id: 1,
  status: 1,
});

module.exports = mongoose.model(
  "RewardRedemption",
  rewardRedemptionSchema
);