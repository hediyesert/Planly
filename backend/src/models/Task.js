const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
  {
    studyPlan: { type: mongoose.Schema.Types.ObjectId, ref: "StudyPlan", required: true, index: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    topic: { type: mongoose.Schema.Types.ObjectId, ref: "Topic", default: null },
    title: { type: String, required: true },
    description: { type: String, default: "" },
    scheduledDate: { type: Date, required: true },
    orderInDay: { type: Number, default: 0 },
    estimatedMinutes: { type: Number, default: 45 },
    completed: { type: Boolean, default: false },
    completedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

taskSchema.index({ studyPlan: 1, scheduledDate: 1 });

module.exports = mongoose.model("Task", taskSchema);
