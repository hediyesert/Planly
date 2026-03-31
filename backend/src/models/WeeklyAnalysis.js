const mongoose = require("mongoose");

const weeklyAnalysisSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    weekStart: { type: Date, required: true },
    snapshot: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

weeklyAnalysisSchema.index({ user: 1, weekStart: 1 }, { unique: true });

module.exports = mongoose.model("WeeklyAnalysis", weeklyAnalysisSchema);
