const Task = require("../models/Task");
const StudyPlan = require("../models/StudyPlan");
const { updatePlanProgress } = require("../services/aiPlannerService");

async function completeTask(req, res, next) {
  try {
    const task = await Task.findOne({ _id: req.params.taskId, user: req.userId });
    if (!task) return res.status(404).json({ message: "Görev bulunamadı" });
    task.completed = true;
    task.completedAt = new Date();
    await task.save();
    await updatePlanProgress(task.studyPlan);
    const plan = await StudyPlan.findById(task.studyPlan).lean();
    return res.json({ task, progressPercent: plan.progressPercent });
  } catch (e) {
    next(e);
  }
}

async function listByPlan(req, res, next) {
  try {
    const { studyPlanId } = req.query;
    if (!studyPlanId) return res.status(400).json({ message: "studyPlanId gerekli" });
    const plan = await StudyPlan.findOne({ _id: studyPlanId, user: req.userId });
    if (!plan) return res.status(404).json({ message: "Plan bulunamadı" });
    const tasks = await Task.find({ studyPlan: studyPlanId }).sort({ scheduledDate: 1, orderInDay: 1 }).lean();
    return res.json(tasks);
  } catch (e) {
    next(e);
  }
}

module.exports = { completeTask, listByPlan };
