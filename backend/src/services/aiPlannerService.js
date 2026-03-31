const Topic = require("../models/Topic");
const StudyPlan = require("../models/StudyPlan");
const Task = require("../models/Task");

async function updatePlanProgress(studyPlanId) {
  const tasks = await Task.find({ studyPlan: studyPlanId });
  if (!tasks.length) return;
  const done = tasks.filter((t) => t.completed).length;
  const p = Math.round((done / tasks.length) * 100);
  await StudyPlan.findByIdAndUpdate(studyPlanId, { progressPercent: p });
}

function localHeuristicPlan({ topics, dayCount, minutesPerDay, start }) {
  const sorted = [...topics].sort((a, b) => (a.order - b.order) || String(a.name).localeCompare(String(b.name)));
  const totalBudget = dayCount * minutesPerDay;
  const perTopic = Math.max(30, Math.floor(totalBudget / Math.max(sorted.length, 1)));

  const defs = [];
  let dayIndex = 0;
  let usedMinutes = 0;
  let orderInDay = 0;
  const d0 = new Date(start);
  d0.setHours(12, 0, 0, 0);

  for (const topic of sorted) {
    let remaining = perTopic;
    while (remaining > 0 && dayIndex < dayCount) {
      const room = minutesPerDay - usedMinutes;
      if (room < 15) {
        dayIndex += 1;
        usedMinutes = 0;
        orderInDay = 0;
        continue;
      }
      const chunk = Math.min(remaining, room, Math.max(30, Math.floor(minutesPerDay * 0.45)));
      const sd = new Date(d0);
      sd.setDate(sd.getDate() + dayIndex);

      defs.push({
        topicId: topic._id,
        title: `${topic.subjectName} — ${topic.name}`,
        description: `Blok çalışma — tahmini ${chunk} dk`,
        scheduledDate: sd,
        orderInDay,
        estimatedMinutes: chunk,
      });
      orderInDay += 1;
      usedMinutes += chunk;
      remaining -= chunk;
      if (usedMinutes >= minutesPerDay - 0.01) {
        dayIndex += 1;
        usedMinutes = 0;
        orderInDay = 0;
      }
    }
  }
  return defs;
}

async function callOpenAIPlan({ topics, dayCount, minutesPerDay, start }) {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return null;
  const model = process.env.OPENAI_MODEL || "gpt-4o-mini";
  const body = {
    model,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content:
          'Sen bir çalışma planı üreticisisin. Sadece geçerli JSON döndür: {"tasks":[{"topicId":"mongoId","title":"string","description":"string","dayOffset":0,"orderInDay":0,"estimatedMinutes":45}]} dayOffset 0 ile başlar, seçilen başlangıç tarihine göre.',
      },
      {
        role: "user",
        content: JSON.stringify({
          topics: topics.map((t) => ({
            id: String(t._id),
            subjectName: t.subjectName,
            name: t.name,
          })),
          dayCount,
          minutesPerDay,
          startDate: start.toISOString(),
        }),
      },
    ],
  };
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`OpenAI ${res.status}: ${errText}`);
  }
  const data = await res.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error("OpenAI yanıtı boş");
  return mapAiTasksJsonToDefs(content, start);
}

function mapAiTasksJsonToDefs(jsonString, start) {
  let s = jsonString.trim();
  if (s.startsWith("```")) {
    s = s.replace(/^```(?:json)?\s*/i, "").replace(/\s*```\s*$/, "");
  }
  const parsed = JSON.parse(s);
  const d0 = new Date(start);
  d0.setHours(12, 0, 0, 0);
  return (parsed.tasks || []).map((t) => {
    const sd = new Date(d0);
    sd.setDate(sd.getDate() + (Number(t.dayOffset) || 0));
    return {
      topicId: t.topicId,
      title: t.title,
      description: t.description || "",
      scheduledDate: sd,
      orderInDay: Number(t.orderInDay) || 0,
      estimatedMinutes: Math.max(15, Number(t.estimatedMinutes) || 45),
    };
  });
}

/** Google AI (Gemini) — https://ai.google.dev/api/generate-content */
async function callGeminiPlan({ topics, dayCount, minutesPerDay, start }) {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return null;
  const model = process.env.GEMINI_MODEL || "gemini-2.0-flash";
  const systemText =
    'Sen bir çalışma planı üreticisisin. Sadece geçerli JSON döndür: {"tasks":[{"topicId":"mongoObjectIdString","title":"string","description":"string","dayOffset":0,"orderInDay":0,"estimatedMinutes":45}]} dayOffset 0 başlangıç günü, ardışık günler için artar. topicId değerleri kullanıcı listesindeki id ile birebir aynı olmalı.';

  const userText = JSON.stringify({
    topics: topics.map((t) => ({
      id: String(t._id),
      subjectName: t.subjectName,
      name: t.name,
    })),
    dayCount,
    minutesPerDay,
    startDate: start.toISOString(),
  });

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
    model
  )}:generateContent?key=${encodeURIComponent(key)}`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: systemText }] },
      contents: [{ role: "user", parts: [{ text: userText }] }],
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.35,
      },
    }),
  });

  const data = await res.json();
  if (!res.ok) {
    const msg = data?.error?.message || JSON.stringify(data);
    throw new Error(`Gemini ${res.status}: ${msg}`);
  }

  const text = data.candidates?.[0]?.content?.parts?.map((p) => p.text).join("") || "";
  if (!text.trim()) throw new Error("Gemini yanıtı boş");
  return mapAiTasksJsonToDefs(text.trim(), start);
}

async function generateStudyPlan({ userId, examTypeId, topicIds, dailyHours, targetDate, startDate }) {
  const start = startDate ? new Date(startDate) : new Date();
  start.setHours(0, 0, 0, 0);
  const target = new Date(targetDate);
  if (Number.isNaN(target.getTime())) {
    const err = new Error("Geçersiz hedef tarih");
    err.statusCode = 400;
    throw err;
  }
  target.setHours(23, 59, 59, 999);
  if (target <= start) {
    const err = new Error("Hedef tarih başlangıçtan sonra olmalıdır");
    err.statusCode = 400;
    throw err;
  }

  const topics = await Topic.find({ _id: { $in: topicIds }, examType: examTypeId }).lean();
  if (!topics.length) {
    const err = new Error("Seçilen sınav türü için konu bulunamadı");
    err.statusCode = 400;
    throw err;
  }

  const msPerDay = 86400000;
  const dayCount = Math.max(1, Math.ceil((target - start) / msPerDay));
  const minutesPerDay = dailyHours * 60;

  let taskDefs;
  let aiNotes = "Yerel algoritma ile kişiselleştirildi";

  const hasGemini = Boolean(process.env.GEMINI_API_KEY);
  const hasOpenAI = Boolean(process.env.OPENAI_API_KEY);

  if (hasGemini) {
    try {
      const fromGemini = await callGeminiPlan({ topics, dayCount, minutesPerDay, start });
      if (fromGemini?.length) {
        taskDefs = fromGemini;
        aiNotes = "Google Gemini ile üretildi";
      }
    } catch (e) {
      console.warn("Gemini plan hatası:", e.message);
    }
  }

  if (!taskDefs?.length && hasOpenAI) {
    try {
      const fromAi = await callOpenAIPlan({ topics, dayCount, minutesPerDay, start });
      if (fromAi?.length) {
        taskDefs = fromAi;
        aiNotes = "OpenAI ile üretildi";
      }
    } catch (e) {
      console.warn("OpenAI plan hatası:", e.message);
    }
  }

  if (!taskDefs?.length) {
    taskDefs = localHeuristicPlan({ topics, dayCount, minutesPerDay, start });
    if (hasGemini || hasOpenAI) {
      aiNotes = "Yerel plan (AI yanıtı yok veya hata)";
    }
  }

  const plan = await StudyPlan.create({
    user: userId,
    examType: examTypeId,
    title: `Çalışma programı — ${target.toLocaleDateString("tr-TR")}`,
    dailyHours,
    targetDate: target,
    startDate: start,
    topicIds,
    aiGenerated: true,
    aiNotes,
  });

  const tasks = taskDefs.map((def) => ({
    studyPlan: plan._id,
    user: userId,
    topic: def.topicId,
    title: def.title,
    description: def.description || "",
    scheduledDate: def.scheduledDate,
    orderInDay: def.orderInDay ?? 0,
    estimatedMinutes: def.estimatedMinutes ?? 45,
  }));

  await Task.insertMany(tasks);
  await updatePlanProgress(plan._id);

  return StudyPlan.findById(plan._id).populate("examType").lean();
}

module.exports = { generateStudyPlan, updatePlanProgress };
