const mongoose = require("mongoose");

const topicSchema = new mongoose.Schema(
  {
    examType: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ExamType",
      required: true,
      index: true,
    },
    subjectName: { type: String, required: true, trim: true },
    name: { type: String, required: true, trim: true },
    order: { type: Number, default: 0 },
    parentTopic: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Topic",
      default: null,
    },
  },
  { timestamps: true }
);

topicSchema.index({ examType: 1, subjectName: 1, order: 1 });

module.exports = mongoose.model("Topic", topicSchema);
