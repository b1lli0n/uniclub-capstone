const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const rewardSchema = new Schema(
  {
    club_id: { type: Schema.Types.ObjectId, ref: "Club", required: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    points_required: { type: Number, required: true, min: 1 },
    quantity: { type: Number, required: true, min: 0 },
    is_active: { type: Boolean, required: true, default: false },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);

rewardSchema.index({ club_id: 1 });
rewardSchema.index({ club_id: 1, is_active: 1 });

module.exports = mongoose.model("Reward", rewardSchema);
