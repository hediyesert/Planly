const mongoose = require("mongoose");

const studySessionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    studyPlan: { type: mongoose.Schema.Types.ObjectId, ref: "StudyPlan", default: null },
    task: { type: mongoose.Schema.Types.ObjectId, ref: "Task", default: null },
    status: {
      type: String,
      enum: ["active", "paused", "completed"],
      default: "active",
    },
    startedAt: { type: Date, required: true },
    endedAt: { type: Date, default: null },
    pausedAt: { type: Date, default: null },
    totalPausedMs: { type: Number, default: 0 },
    totalFocusMs: { type: Number, default: null },
  },
  { timestamps: true }
);

studySessionSchema.index({ user: 1, status: 1 });

module.exports = mongoose.model("StudySession", studySessionSchema);
