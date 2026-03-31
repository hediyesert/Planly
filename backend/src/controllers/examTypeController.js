const mongoose = require("mongoose");
const ExamType = require("../models/ExamType");
const Topic = require("../models/Topic");

/**
 * Eski / dış kaynak formatı: tek belgede subjectName + topics: ["konu1", "konu2", ...]
 * Uygulama her konu için ayrı Topic belgesi bekler; ilk listelemede normalize eder.
 */
async function expandEmbeddedTopicsIfNeeded(examTypeId) {
  let oid;
  try {
    oid = new mongoose.Types.ObjectId(examTypeId);
  } catch {
    return;
  }
  const col = Topic.collection;
  const candidates = await col
    .find({
      examType: oid,
      topics: { $exists: true, $type: "array", $ne: [] },
    })
    .toArray();

  for (const doc of candidates) {
    const arr = doc.topics;
    if (!Array.isArray(arr) || arr.length === 0) continue;
    if (typeof arr[0] !== "string") continue;
    if (doc.name != null && String(doc.name).trim() !== "") continue;

    const subjectName = ((doc.subjectName || "Genel").toString().trim()) || "Genel";
    const newRows = arr
      .filter((t) => typeof t === "string" && t.trim())
      .map((raw, i) => ({
        examType: oid,
        subjectName,
        name: raw.trim(),
        order: i,
      }));
    if (!newRows.length) continue;

    await Topic.insertMany(newRows);
    await col.deleteOne({ _id: doc._id });
  }
}

async function listExamTypes(req, res, next) {
  try {
    const items = await ExamType.find().sort({ name: 1 }).lean();
    return res.json(items);
  } catch (e) {
    next(e);
  }
}

async function listTopicsByExam(req, res, next) {
  try {
    const { examTypeId } = req.params;
    await expandEmbeddedTopicsIfNeeded(examTypeId);
    const topics = await Topic.find({ examType: examTypeId }).sort({ subjectName: 1, order: 1, name: 1 }).lean();
    const idSet = new Set(topics.map((x) => String(x._id)));

    /** Üst konu bu sınavın listesinde yoksa veya parent yoksa kök gibi göster (aksi halde tüm ağaç kayboluyordu) */
    function isRootTopic(t) {
      const p = t.parentTopic;
      if (!p) return true;
      return !idSet.has(String(p));
    }

    const bySubject = new Map();
    for (const t of topics) {
      if (!isRootTopic(t)) continue;
      if (!bySubject.has(t.subjectName)) bySubject.set(t.subjectName, []);
      const subtopics = topics
        .filter((x) => x.parentTopic && String(x.parentTopic) === String(t._id))
        .sort((a, b) => a.order - b.order)
        .map((c) => ({ id: c._id, name: c.name, order: c.order }));
      bySubject.get(t.subjectName).push({
        id: t._id,
        name: t.name,
        order: t.order,
        subtopics: subtopics.length ? subtopics : undefined,
      });
    }
    const subjects = Array.from(bySubject.entries()).map(([subjectName, list]) => ({
      subjectName,
      topics: list,
    }));
    return res.json({ examTypeId, subjects });
  } catch (e) {
    next(e);
  }
}

module.exports = { listExamTypes, listTopicsByExam };
