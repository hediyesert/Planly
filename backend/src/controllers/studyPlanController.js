const mongoose = require("mongoose");
const StudyPlan = require("../models/StudyPlan");
const Task = require("../models/Task");
const { generateStudyPlan } = require("../services/aiPlannerService");

async function aiGenerate(req, res, next) {
  try {
    const { examTypeId, topicIds, dailyHours, targetDate, startDate } = req.body;
    if (!examTypeId || !Array.isArray(topicIds) || topicIds.length === 0) {
      return res.status(400).json({ message: "examTypeId ve topicIds gerekli" });
    }
    if (dailyHours === undefined || dailyHours < 0.5) {
      return res.status(400).json({ message: "dailyHours en az 0.5 olmalı" });
    }
    const normalizedTopics = topicIds.map((id) => new mongoose.Types.ObjectId(id));
    const plan = await generateStudyPlan({
      userId: req.userId,
      examTypeId,
      topicIds: normalizedTopics,
      dailyHours: Number(dailyHours),
      targetDate,
      startDate,
    });
    const tasks = await Task.find({ studyPlan: plan._id }).sort({ scheduledDate: 1, orderInDay: 1 }).lean();
    return res.status(201).json({ plan, tasks });
  } catch (e) {
    next(e);
  }
}

async function listMine(req, res, next) {
  try {
    const plans = await StudyPlan.find({ user: req.userId }).sort({ createdAt: -1 }).populate("examType").lean();
    return res.json(plans);
  } catch (e) {
    next(e);
  }
}

async function getOne(req, res, next) {
  try {
    const plan = await StudyPlan.findOne({ _id: req.params.id, user: req.userId }).populate("examType").lean();
    if (!plan) return res.status(404).json({ message: "Plan bulunamadı" });
    const tasks = await Task.find({ studyPlan: plan._id }).sort({ scheduledDate: 1, orderInDay: 1 }).lean();
    return res.json({ plan, tasks });
  } catch (e) {
    next(e);
  }
}

module.exports = { aiGenerate, listMine, getOne };
