const mongoose = require("mongoose");

const examTypeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    description: { type: String, default: "" },
  },
  { timestamps: true }
);

// Varsayılan: mongoose "examtypes" koleksiyonunu kullanır.
// Atlas'ta sınavlar "exams" adlı koleksiyondaysa: EXAM_TYPES_COLLECTION=exams
const collection = process.env.EXAM_TYPES_COLLECTION?.trim();

if (collection) {
  module.exports = mongoose.model("ExamType", examTypeSchema, collection);
} else {
  module.exports = mongoose.model("ExamType", examTypeSchema);
}
