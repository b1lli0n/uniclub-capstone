const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const contributionLogSchema = Schema(
  {
    membership_id: {
      type: Schema.Types.ObjectId,
      ref: "ClubMember",
      required: true,
    },

    event_id: {
      type: Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },

    rule_id: {
      type: Schema.Types.ObjectId,
      ref: "PointRule",
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

    month_key: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: false },
  }
);

// Index to optimize monthly leaderboard queries and limits checking
contributionLogSchema.index({ membership_id: 1, month_key: 1 });
contributionLogSchema.index({ membership_id: 1, event_id: 1, action_type_id: 1 });
contributionLogSchema.index({ membership_id: 1, action_type_id: 1, created_at: 1 });

module.exports = mongoose.model("ContributionLog", contributionLogSchema);
