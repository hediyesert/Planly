const mongoose = require("mongoose");
const ExamType = require("../models/ExamType");
const Topic = require("../models/Topic");

function slugCode(name) {
  const s = String(name)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .toUpperCase();
  return (s || "EXAM").slice(0, 50);
}

async function uniqueCode(base) {
  let code = base.slice(0, 64);
  let n = 0;
  while (await ExamType.exists({ code })) {
    n += 1;
    code = `${base.slice(0, 50)}_${n}`;
  }
  return code;
}

/** Atlas'taki exams vb. koleksiyondan ExamType + Topic üretir */
function topicsFromPart(examPart) {
  const raw = examPart.topics || examPart.subjects || examPart.konular || examPart.dersler;
  if (!Array.isArray(raw)) return [];
  const out = [];
  let order = 0;
  for (const t of raw) {
    if (!t || typeof t !== "object") continue;
    const subjectName = (t.subjectName || t.subject || t.ders || "Genel").toString().trim();
    const name = (t.name || t.topic || t.konu || t.title || "").toString().trim();
    if (!name) continue;
    out.push({
      subjectName: subjectName || "Genel",
      name,
      order: Number(t.order) >= 0 ? Number(t.order) : order,
    });
    order += 1;
  }
  return out;
}

function flattenExamParts(doc) {
  const seen = new Set();
  const results = [];

  function pushPart(p) {
    const name = p?.name || p?.title || p?.examName;
    if (!name || typeof name !== "string") return;
    const key = JSON.stringify({ name, code: p.code || p.slug });
    if (seen.has(key)) return;
    seen.add(key);
    results.push(p);
  }

  pushPart(doc);

  for (const k of Object.keys(doc || {})) {
    if (k === "_id" || k === "__v") continue;
    const v = doc[k];
    if (v && typeof v === "object" && !Array.isArray(v) && !(v instanceof mongoose.Types.ObjectId)) {
      pushPart(v);
    }
  }

  if (results.length === 0 && Array.isArray(doc?.items)) {
    for (const p of doc.items) pushPart(p);
  }
  if (results.length === 0 && Array.isArray(doc?.exams)) {
    for (const p of doc.exams) pushPart(p);
  }

  return results;
}

async function importFromLegacyExamsCollection() {
  const enabled = process.env.IMPORT_LEGACY_EXAMS === "true" || process.env.IMPORT_LEGACY_EXAMS === "1";
  if (!enabled) return false;

  const colName = process.env.LEGACY_EXAMS_COLLECTION || "exams";
  const db = mongoose.connection.db;
  const cols = await db.listCollections({ name: colName }).toArray();
  if (!cols.length) {
    console.warn(`Legacy import: "${colName}" koleksiyonu yok, varsayılan seed kullanılacak`);
    return false;
  }

  const raw = await db.collection(colName).find({}).toArray();
  if (!raw.length) return false;

  let examCount = 0;
  let topicCount = 0;

  for (const doc of raw) {
    const parts = flattenExamParts(doc);
    for (const part of parts) {
      const name = (part.name || part.title || part.examName).trim();
      const baseCode = slugCode(part.code || part.slug || name);
      const code = await uniqueCode(baseCode);
      const description = String(part.description || part.desc || "").trim();

      let exam;
      try {
        exam = await ExamType.create({ name, code, description });
      } catch (e) {
        if (e.code === 11000) continue;
        throw e;
      }
      examCount += 1;

      const rows = topicsFromPart(part);
      for (const r of rows) {
        await Topic.create({
          examType: exam._id,
          subjectName: r.subjectName,
          name: r.name,
          order: r.order,
        });
        topicCount += 1;
      }
    }
  }

  if (examCount > 0) {
    console.log(
      `Atlas legacy "${colName}": ${examCount} sınav türü, ${topicCount} konu → examtypes / topics aktarıldı`
    );
    return true;
  }

  console.warn(
    `Legacy "${colName}" okundu ama uygun alan (name/title + isteğe bağlı topics) bulunamadı; ` +
      `doc yapını examType { name, code?, topics: [{ subjectName?, name }] } ile uyumlu hale getirin.`
  );
  return false;
}

async function seedExamData() {
  if ((await ExamType.countDocuments()) > 0) return;

  if (await importFromLegacyExamsCollection()) return;

  const tyt = await ExamType.create({
    name: "YKS - TYT",
    code: "YKS_TYT",
    description: "Temel Yeterlilik Testi",
  });
  const ayt = await ExamType.create({
    name: "YKS - AYT",
    code: "YKS_AYT",
    description: "Alan Yeterlilik Testi",
  });
  const lgs = await ExamType.create({
    name: "LGS",
    code: "LGS",
    description: "Liselere Geçiş Sınavı",
  });

  const tytTopics = [
 ["Türkçe", "Sözcükte Anlam", 1],
 ["Türkçe", "Cümlede Anlam", 2],
 ["Türkçe", "Paragraf", 3],
 ["Matematik", "Temel Kavramlar ve Sayılar", 1],
 ["Matematik", "Rasyonel Sayılar", 2],
 ["Matematik", "Üslü ve Köklü Sayılar", 3],
 ["Fen Bilimleri", "Canlılar ve Hayat", 1],
 ["Fen Bilimleri", "Madde ve Değişim", 2],
 ["Sosyal Bilimler", "Tarih", 1],
 ["Sosyal Bilimler", "Coğrafya", 2],
  ];

  const aytTopics = [
 ["Matematik", "Trigonometri", 1],
 ["Matematik", "Limit ve Süreklilik", 2],
 ["Matematik", "Türev", 3],
 ["Fizik", "Kuvvet ve Hareket", 1],
 ["Fizik", "Elektrik ve Manyetizma", 2],
 ["Kimya", "Kimyasal Tepkimeler", 1],
 ["Biyoloji", "Hücre ve Bölünmeler", 1],
  ];

  const lgsTopics = [
 ["Türkçe", "Anlam Bilgisi", 1],
 ["Türkçe", "Yazım Kuralları", 2],
 ["Matematik", "Problemler", 1],
 ["Matematik", "Geometri", 2],
 ["Fen Bilimleri", "Fiziksel Olaylar", 1],
 ["İnkılap Tarihi", "Milli Mücadele", 1],
  ];

  async function bulk(exam, rows) {
    for (const [subjectName, name, order] of rows) {
      await Topic.create({ examType: exam._id, subjectName, name, order });
    }
  }

  await bulk(tyt, tytTopics);
  await bulk(ayt, aytTopics);
  await bulk(lgs, lgsTopics);

  console.log("Örnek sınav türleri ve konular yüklendi");
}

module.exports = { seedExamData };
