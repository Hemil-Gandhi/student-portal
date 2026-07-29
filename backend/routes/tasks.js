const express = require('express');
const auth = require('../middleware/auth');
const Task = require('../models/Task');
const Notification = require('../models/Notification');
const { sendTaskNotification } = require('../services/email.service');

const router = express.Router();

router.get('/', auth, async (req, res) => {
  try {
    const query = { user: req.user._id };
    if (req.query.status) query.status = req.query.status;
    if (req.query.priority) query.priority = req.query.priority;
    if (req.query.category) query.category = req.query.category;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const [tasks, totalCount] = await Promise.all([
      Task.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Task.countDocuments(query)
    ]);
    res.json({ tasks, totalPages: Math.ceil(totalCount / limit), currentPage: page, totalCount });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.get('/stats', auth, async (req, res) => {
  try {
    const now = new Date();
    const tasks = await Task.find({ user: req.user._id });
    const statusStats = await Task.aggregate([{ $match: { user: req.user._id } }, { $group: { _id: '$status', count: { $sum: 1 } } }]);
    const priorityStats = await Task.aggregate([{ $match: { user: req.user._id } }, { $group: { _id: '$priority', count: { $sum: 1 } } }]);
    const upcomingTasks = tasks.filter(t => t.dueDate && new Date(t.dueDate) >= now && t.status !== 'completed').length;
    const overdueTasks = tasks.filter(t => t.dueDate && new Date(t.dueDate) < now && t.status !== 'completed').length;
    res.json({ statusStats, priorityStats, upcomingTasks, overdueTasks });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.post('/', auth, async (req, res) => {
  try {
    const task = new Task({ ...req.body, user: req.user._id });
    await task.save();

    const prefs = req.user.notificationPreferences || {};
    if (prefs.emailEnabled && prefs.onTaskCreated) {
      const sent = await sendTaskNotification(req.user, task);
      await Notification.create({
        user: req.user._id,
        type: 'task_created',
        title: `New task: ${task.title}`,
        message: `Task "${task.title}" was created with ${task.priority} priority.`,
        referenceId: task._id,
        referenceModel: 'Task',
        emailSent: sent,
        emailError: sent ? undefined : 'Failed to send'
      });
    }

    res.status(201).json({ message: 'Task created', task });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.put('/:id', auth, async (req, res) => {
  try {
    if (req.body.status === 'completed') req.body.completedAt = new Date();
    const task = await Task.findOneAndUpdate({ _id: req.params.id, user: req.user._id }, req.body, { new: true });
    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.json({ message: 'Task updated', task });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.json({ message: 'Task deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
