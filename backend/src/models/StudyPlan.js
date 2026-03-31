const mongoose = require("mongoose");

const studyPlanSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    examType: { type: mongoose.Schema.Types.ObjectId, ref: "ExamType", required: true },
    title: { type: String, default: "Çalışma programı" },
    dailyHours: { type: Number, required: true, min: 0.5, max: 16 },
    targetDate: { type: Date, required: true },
    startDate: { type: Date, required: true },
    topicIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Topic" }],
    aiGenerated: { type: Boolean, default: true },
    aiNotes: { type: String, default: "" },
    progressPercent: { type: Number, default: 0, min: 0, max: 100 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("StudyPlan", studyPlanSchema);
