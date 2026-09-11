const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const answerSchema = new Schema(
  {
    question_id: {
      type: Schema.Types.ObjectId,
      required: false, // Cho phép linh hoạt để tương thích dữ liệu cũ
    },
    value: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { _id: false }
);

const joinRequestSchema = Schema(
  {
    user_id: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    club_id: {
      type: Schema.Types.ObjectId,
      ref: "Club",
      required: true,
    },

    form_id: {
      type: Schema.Types.ObjectId,
      ref: "JoinForm",
      required: true,
    },

    answers: {
      type: [answerSchema],
      set: (val) => {
        if (Array.isArray(val)) {
          return val.map((ans) => {
            if (typeof ans === "string") {
              return { value: ans.trim() };
            }
            return ans;
          });
        }
        return val;
      },
      required: true,
      validate: {
        validator(value) {
          return Array.isArray(value) && value.length > 0;
        },
        message: "Answers must not be empty",
      },
    },

    status: {
      type: String,
      required: true,
      enum: ["pending", "approved", "rejected", "cancelled"],
      default: "pending",
    },

    reviewed_by: {
      type: Schema.Types.ObjectId,
      ref: "ClubMember",
      default: null,
    },

    review_note: {
      type: String,
      default: "",
    },

    reviewed_at: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);

joinRequestSchema.index({ user_id: 1, club_id: 1, status: 1 });
joinRequestSchema.index({ club_id: 1, status: 1 });

module.exports = mongoose.model("JoinRequest", joinRequestSchema);
