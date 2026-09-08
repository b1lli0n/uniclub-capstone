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

    reward_point: {
      type: Number,
      required: true,
    },

    limit_per_event: {
      type: Number,
      required: true,
    },

    limit_per_day: {
      type: Number,
      required: true,
    },

    is_active: {
      type: Boolean,
      required: true,
      default: false,
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

module.exports = mongoose.model("PointRule", pointRuleSchema);
