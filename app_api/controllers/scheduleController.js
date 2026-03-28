const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const flattenTopics = (topicsObj) => {
  if (!topicsObj || typeof topicsObj !== "object") return [];
  return Object.values(topicsObj)
    .flatMap((arr) => (Array.isArray(arr) ? arr : []))
    .filter(Boolean);
};

const DAYS = ["Pazartesi", "Sali", "Carsamba", "Persembe", "Cuma", "Cumartesi", "Pazar"];
const WEEKS = [1, 2, 3, 4];

const buildPrompt = ({ exam, subjects, topics, hours, deadline }) => {
  const subjectsText = Array.isArray(subjects) ? subjects.join(", ") : "";
  const flatTopics = flattenTopics(topics);
  const topicsText = flatTopics.length ? flatTopics.join(", ") : "Belirtilmedi";

  // ÖNEMLİ: Çıktı sadece JSON olsun; aksi durumda parse başarısız olur.
  return [
    "Sen bir eğitim koçusun.",
    "Kullanıcı için uygulanabilir, gerçekçi ve motive edici bir çalışma planı üret.",
    "",
    `Sınav: ${exam || ""}`,
    `Seçilen dersler: ${subjectsText}`,
    `Seçilen alt konular: ${topicsText}`,
    `Günlük çalışma süresi: ${hours} saat`,
    `Hedef tarih: ${deadline || "Belirtilmedi"}`,
    "",
    "Çıktı formatı: SADECE geçerli JSON döndür.",
    "JSON şu şemaya uysun (ek alan ekleme, anahtar adlarını birebir kullan):",
    "{",
    '  "planText": "string",',
    '  "weeks": [',
    "    {",
    '      "week": 1,',
    '      "days": [',
    "        {",
    '          "day": "Pazartesi",',
    '          "items": [',
    "            {",
    '              "id": "w1-d0-i0",',
    '              "kind": "study|review|mini_test",',
    '              "label": "string",',
    '              "topic": "string",',
    '              "durationMins": 0',
    "            }",
    "          ]",
    "        }",
    "      ]",
    "    }",
    "  ]",
    "}",
    "",
    "Kurallar:",
    "1) planText tamamen Türkçe olsun (kısa strateji + haftalık kontrol checklist'i yeterli).",
    "2) weeks içinde 4 hafta olsun, her hafta içinde 7 gün olsun (DAYS dizisini kullan).",
    "3) Her gün için items 3 tane olsun:",
    "   - study: study türü (durationMins = hours*60)",
    "   - review: 30 dk tekrar",
    "   - mini_test: 20 soruluk mini test (durationMins sayısal olabilir, örn. 45).",
    "4) topic seçiminde seçilen alt konuları günlere sırayla dağıt (flatTopics'tan). Eğer flatTopics boşsa ders adlarını kullan.",
    "5) id'ler deterministik olsun: w{week}-d{dayIndex}-i{itemIndex} (itemIndex: 0 study, 1 review, 2 mini_test).",
  ].join("\n");
};

const FALLBACK_MODELS = ["gemini-2.0-flash", "gemini-1.5-flash-latest", "gemini-pro"];

const createOfflineScheduleData = ({ exam, subjects, topics, hours, deadline }) => {
  const flatTopics = flattenTopics(topics);
  const topicPool = flatTopics.length ? flatTopics : Array.isArray(subjects) ? subjects : [];
  const safeTopicPool = topicPool.length ? topicPool : ["Genel tekrar"];

  const planLines = [];
  planLines.push(`# ${exam} için 4 haftalık çalışma planı`);
  planLines.push("");
  planLines.push("## Strateji");
  planLines.push("- Her gün sabit saatte çalışmaya başla.");
  planLines.push("- Konu + tekrar + mini test dengesini koru.");
  planLines.push(`- Günlük hedef: ${hours} saat.`);
  if (deadline) planLines.push(`- Hedef tarih: ${deadline}`);
  planLines.push("");
  planLines.push("## Haftalık kontrol checklist");
  planLines.push("- [ ] Çalışma saat hedefi tamamlandı");
  planLines.push("- [ ] Zorlanılan konular not alındı");
  planLines.push("- [ ] En az 2 deneme/quiz çözüldü");
  planLines.push("- [ ] Bir sonraki hafta için düzenleme yapıldı");

  let idx = 0;
  const weeks = WEEKS.map((w) => {
    const days = DAYS.map((dayName, dIdx) => {
      const topic = safeTopicPool[idx % safeTopicPool.length];
      idx += 1;

      const studyMins = Math.max(1, Math.round(Number(hours) * 60));
      return {
        day: dayName,
        items: [
          {
            id: `w${w}-d${dIdx}-i0`,
            kind: "study",
            label: `${studyMins} dk çalışma: ${topic}`,
            topic,
            durationMins: studyMins,
          },
          {
            id: `w${w}-d${dIdx}-i1`,
            kind: "review",
            label: `30 dk tekrar: ${topic}`,
            topic,
            durationMins: 30,
          },
          {
            id: `w${w}-d${dIdx}-i2`,
            kind: "mini_test",
            label: "20 soruluk mini test",
            topic,
            durationMins: 45,
          },
        ],
      };
    });

    return { week: w, days };
  });

  return {
    planText: planLines.join("\n"),
    schedule: { weeks },
  };
};

const extractJsonObject = (text) => {
  if (!text) return null;
  const s = String(text);
  const start = s.indexOf("{");
  const end = s.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) return null;
  const candidate = s.slice(start, end + 1);
  try {
    return JSON.parse(candidate);
  } catch {
    return null;
  }
};

const generateWithModelFallback = async (prompt) => {
  let lastError = null;

  for (const modelName of FALLBACK_MODELS) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent(prompt);
      const text = result?.response?.text?.();
      if (text && String(text).trim()) {
        const parsed = extractJsonObject(text);
        if (parsed?.weeks && Array.isArray(parsed.weeks)) {
          return {
            planText: parsed.planText || null,
            schedule: { weeks: parsed.weeks },
            modelName,
            usedOfflineFallback: false,
          };
        }
        // JSON parse edilemezse fallback'e geç
      }
    } catch (err) {
      lastError = err;
    }
  }

  return {
    usedOfflineFallback: true,
    modelName: null,
    errorMessage: lastError?.message || "AI modeli kullanilamadi",
  };
};

// Frontend'in beklediği: POST /api/generate-schedule
exports.generateSchedule = async (req, res) => {
  try {
    const { exam, subjects, topics, hours, deadline } = req.body;

    if (!exam || !Array.isArray(subjects) || subjects.length === 0 || !hours) {
      return res.status(400).json({
        message: "Eksik bilgi var. Sınav, konu ve süre alanlarını doldurun.",
      });
    }

    const prompt = buildPrompt({ exam, subjects, topics, hours, deadline });
    const aiResult = await generateWithModelFallback(prompt);
    const offline = createOfflineScheduleData({ exam, subjects, topics, hours, deadline });

    const planText = aiResult.usedOfflineFallback ? offline.planText : aiResult.planText || offline.planText;
    const schedule = aiResult.usedOfflineFallback ? offline.schedule : aiResult.schedule;

    res.json({
      message: aiResult.usedOfflineFallback
        ? "AI su anda ulasilamaz durumda oldugu icin yedek plan uretildi."
        : "Plan uretildi",
      plan: planText,
      schedule,
      meta: {
        exam,
        hours,
        deadline: deadline || null,
        subjectsCount: subjects.length,
        topicsCount: flattenTopics(topics).length,
        generator: aiResult.usedOfflineFallback ? "offline-fallback" : aiResult.modelName,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Plan üretilemedi", error: err.message });
  }
};

