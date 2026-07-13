const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const pointRuleSchema = Schema(
  {
    club_id: {
      type: Schema.Types.ObjectId,
      ref: "Club",
      required: true,
    },

    action_type_id: {
      type: Schema.Types.ObjectId,
      ref: "ActionType",
      required: true,
    },

    achievement_point: {
      type: Number,
      required: true,
      min: 0,
    },

    reward_point: {
      type: Number,
      required: true,
      min: 0,
    },

    limit_per_event: {
      type: Number,
      required: true,
      min: 0,
    },

    limit_per_day: {
      type: Number,
      required: true,
      min: 0,
    },

    is_active: {
      type: Boolean,
      required: true,
      default: false,
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
      updatedAt: false,
    },
  }
);

pointRuleSchema.index({
  club_id: 1,
  action_type_id: 1,
});

pointRuleSchema.index({
  club_id: 1,
  is_active: 1,
});

module.exports = mongoose.model("PointRule", pointRuleSchema);