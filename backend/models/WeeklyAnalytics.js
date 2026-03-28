const mongoose = require("mongoose");

const DailyStatSchema = new mongoose.Schema(
  {
    dateKey: { type: String, required: true }, // YYYY-MM-DD
    completedTasks: { type: Number, default: 0 },
    studyMinutes: { type: Number, default: 0 },
  },
  { _id: false }
);

const WeeklyAnalyticsSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
    weekStart: { type: Date, required: true, index: true },
    dailyStats: { type: [DailyStatSchema], default: [] },
  },
  { timestamps: true }
);

WeeklyAnalyticsSchema.index({ userId: 1, weekStart: 1 }, { unique: true });

module.exports = mongoose.model("WeeklyAnalytics", WeeklyAnalyticsSchema);

