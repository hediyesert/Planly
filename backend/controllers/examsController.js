const Exam = require("../models/Exam");

const normalizeSingleExam = (raw) => {
  if (!raw || typeof raw !== "object") return null;
  const name = raw.name ?? raw.Name ?? raw.examName ?? "";
  const subjectsRaw = raw.subjects ?? raw.Subjects ?? raw.subjectsList ?? [];

  const subjects = Array.isArray(subjectsRaw)
    ? subjectsRaw
        .map((s) => {
          if (typeof s === "string") return { name: s, topics: [] };
          if (!s || typeof s !== "object") return null;
          const subjectName = s.name ?? s.subjectName ?? s.title ?? "";
          const topicsRaw = s.topics ?? s.topic ?? s.subTopics ?? [];
          const topics = Array.isArray(topicsRaw) ? topicsRaw : [];
          if (!subjectName) return null;
          return { name: subjectName, topics };
        })
        .filter(Boolean)
    : [];

  if (!name) return null;
  return { name, subjects };
};

const unwrapExamDocument = (doc) => {
  // Normal durumda her doküman zaten bir sınavdır.
  const direct = normalizeSingleExam(doc);
  if (direct) return [direct];

  // Eski/yanlış format: tek doküman içinde 0,1,2... alanları.
  const nestedExams = Object.keys(doc || {})
    .filter((k) => /^\d+$/.test(k))
    .sort((a, b) => Number(a) - Number(b))
    .map((k) => normalizeSingleExam(doc[k]))
    .filter(Boolean);

  return nestedExams;
};

// Frontend'in beklediği: GET /api/exams
exports.listExams = async (req, res) => {
  try {
    const docs = await Exam.find().lean();
    const normalized = docs.flatMap(unwrapExamDocument);
    res.json(normalized);
  } catch (err) {
    res.status(500).json({ message: "Sınavlar getirilemedi", error: err.message });
  }
};

