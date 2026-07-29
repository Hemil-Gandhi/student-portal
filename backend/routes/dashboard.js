const express = require('express');
const auth = require('../middleware/auth');
const Task = require('../models/Task');
const Exam = require('../models/Exam');
const Note = require('../models/Note');
const Expense = require('../models/Expense');
const Attendance = require('../models/Attendance');
const Placement = require('../models/Placement');

const router = express.Router();

router.get('/', auth, async (req, res) => {
  try {
    const userId = req.user._id;
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const tasks = await Task.find({ user: userId });
    const pendingTasks = tasks.filter(t => t.status === 'pending').length;
    const completedTasks = tasks.filter(t => t.status === 'completed').length;
    const inProgressTasks = tasks.filter(t => t.status === 'in-progress').length;

    const expenses = await Expense.find({ user: userId });
    const todayExpenses = expenses.filter(e => new Date(e.date).toDateString() === now.toDateString()).reduce((s, e) => s + e.amount, 0);
    const monthlyExpenses = expenses.filter(e => new Date(e.date) >= startOfMonth).reduce((s, e) => s + e.amount, 0);

    const attendance = await Attendance.find({ user: userId });
    const presentCount = attendance.filter(a => a.status === 'present').length;
    const attendancePercentage = attendance.length > 0 ? Math.round((presentCount / attendance.length) * 100) : 0;

    const exams = await Exam.find({ user: userId });
    const completedExams = exams.filter(e => e.status === 'completed' && e.percentage != null);
    const avgPercentage = completedExams.length > 0 ? Math.round(completedExams.reduce((s, e) => s + e.percentage, 0) / completedExams.length) : 0;

    const placements = await Placement.find({ user: userId });
    const appliedPlacements = placements.filter(p => p.status === 'applied').length;
    const interviewingPlacements = placements.filter(p => p.status === 'interviewing').length;
    const offers = placements.filter(p => p.status === 'offer-received').length;
    const accepted = placements.filter(p => p.status === 'accepted').length;

    const favorites = await Note.countDocuments({ user: userId, isFavorite: true });

    const upcomingTasks = await Task.find({ user: userId, status: { $ne: 'completed' }, dueDate: { $gte: now } }).sort({ dueDate: 1 }).limit(5);
    const upcomingExams = await Exam.find({ user: userId, status: 'upcoming', examDate: { $gte: now } }).sort({ examDate: 1 }).limit(5);
    const recentNotes = await Note.find({ user: userId }).sort({ updatedAt: -1 }).limit(5);

    res.json({
      overview: {
        tasks: { pending: pendingTasks, completed: completedTasks, inProgress: inProgressTasks, total: tasks.length },
        expenses: { today: todayExpenses, monthly: monthlyExpenses },
        attendance: { percentage: attendancePercentage, totalClasses: attendance.length },
        exams: { averagePercentage: avgPercentage, totalExams: exams.length },
        placements: { applied: appliedPlacements, interviewing: interviewingPlacements, offers, accepted },
        notes: { favorites }
      },
      upcomingTasks,
      upcomingExams,
      recentNotes
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
