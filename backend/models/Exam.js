const mongoose = require("mongoose");

const examSchema = new mongoose.Schema({
  // YKS, KPSS, HMGS...
  name: { type: String, required: true, trim: true },
  subjects: [
    {
      name: { type: String, trim: true },
      // ["Türev", "İntegral"]
      topics: { type: [String], default: [] },
    },
  ],
});

module.exports = mongoose.model("Exam", examSchema);