const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const actionTypeSchema = Schema(
  {
    code: {
      type: String,
      required: true,
      trim: true,
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
    },

    is_active: {
      type: Boolean,
      required: true,
      default: true,
    },
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: false,
    },
  }
);

actionTypeSchema.index({ code: 1 }, { unique: true });
actionTypeSchema.index({ is_active: 1 });

module.exports = mongoose.model("ActionType", actionTypeSchema);