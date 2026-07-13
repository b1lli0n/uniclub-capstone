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
      required: false,
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

    point_cost: {
      type: Number,
      required: false,
    },

    quantity: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },

    is_active: {
      type: Boolean,
      required: true,
      default: false,
    },

    status: {
      type: String,
      required: true,
      enum: ["active", "hidden"],
      default: "active",
    },

    created_by: {
      type: Schema.Types.ObjectId,
      ref: "User",
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

// Pre-save hook to synchronize points_required/point_cost and is_active/status
rewardSchema.pre("save", function (next) {
  // Sync point_cost and points_required
  if (this.point_cost !== undefined) {
    this.points_required = this.point_cost;
  } else if (this.points_required !== undefined) {
    this.point_cost = this.points_required;
  }

  // Sync status and is_active
  if (this.status !== undefined) {
    this.is_active = (this.status === "active");
  } else if (this.is_active !== undefined) {
    this.status = this.is_active ? "active" : "hidden";
  }

  next();
});

rewardSchema.index({ club_id: 1 });
rewardSchema.index({ club_id: 1, is_active: 1 });
rewardSchema.index({ club_id: 1, status: 1 });
rewardSchema.index({ club_id: 1, created_at: -1 });
rewardSchema.index({ club_id: 1, name: 1 });

module.exports = mongoose.model("Reward", rewardSchema);
