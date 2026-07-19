const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const rewardTransactionSchema = new Schema(
  {
    // Project hiện dùng model ClubMember cho membership của một user trong CLB.
    membership_id: { type: Schema.Types.ObjectId, ref: "ClubMember", required: true },
    reward_id: { type: Schema.Types.ObjectId, ref: "Reward", required: true },
    points_spent: { type: Number, required: true, min: 1 },
    // 0 = pending, 1 = approved, 2 = rejected, 3 = completed
    status: { type: Number, enum: [0, 1, 2, 3], default: 0, required: true },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);

rewardTransactionSchema.index({ membership_id: 1 });
rewardTransactionSchema.index({ reward_id: 1 });
rewardTransactionSchema.index({ status: 1 });

module.exports = mongoose.model("RewardTransaction", rewardTransactionSchema);
