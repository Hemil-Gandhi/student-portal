const express = require('express');
const auth = require('../middleware/auth');
const User = require('../models/User');
const Task = require('../models/Task');
const Exam = require('../models/Exam');
const Note = require('../models/Note');
const Expense = require('../models/Expense');
const Attendance = require('../models/Attendance');
const Placement = require('../models/Placement');

const router = express.Router();

const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin access required' });
  next();
};

router.get('/users', auth, requireAdmin, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const [users, totalCount] = await Promise.all([
      User.find().select('-password').sort({ createdAt: -1 }).skip(skip).limit(limit),
      User.countDocuments()
    ]);
    res.json({ users, totalPages: Math.ceil(totalCount / limit), currentPage: page, totalCount });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.put('/users/:id/role', auth, requireAdmin, async (req, res) => {
  try {
    const { role } = req.body;
    if (!['student', 'admin'].includes(role)) return res.status(400).json({ message: 'Invalid role' });
    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true }).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'User role updated', user });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.delete('/users/:id', auth, requireAdmin, async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    await Promise.all([
      Task.deleteMany({ user: user._id }),
      Exam.deleteMany({ user: user._id }),
      Note.deleteMany({ user: user._id }),
      Expense.deleteMany({ user: user._id }),
      Attendance.deleteMany({ user: user._id }),
      Placement.deleteMany({ user: user._id })
    ]);
    res.json({ message: 'User and all associated data deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.get('/stats', auth, requireAdmin, async (req, res) => {
  try {
    const [totalUsers, totalTasks, totalExams, totalNotes, totalExpenses, totalAttendance, totalPlacements] = await Promise.all([
      User.countDocuments(),
      Task.countDocuments(),
      Exam.countDocuments(),
      Note.countDocuments(),
      Expense.countDocuments(),
      Attendance.countDocuments(),
      Placement.countDocuments()
    ]);
    res.json({
      totalUsers, totalTasks, totalExams, totalNotes,
      totalExpenses, totalAttendance, totalPlacements
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

const getAllEntries = (Model, modelName) => async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;
    const query = {};
    if (req.query.userId) query.user = req.query.userId;
    const [entries, totalCount] = await Promise.all([
      Model.find(query).populate('user', 'name email studentId department year').sort({ createdAt: -1 }).skip(skip).limit(limit),
      Model.countDocuments(query)
    ]);
    res.json({ [modelName]: entries, totalPages: Math.ceil(totalCount / limit), currentPage: page, totalCount });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

router.get('/entries/tasks', auth, requireAdmin, getAllEntries(Task, 'tasks'));
router.get('/entries/notes', auth, requireAdmin, getAllEntries(Note, 'notes'));
router.get('/entries/exams', auth, requireAdmin, getAllEntries(Exam, 'exams'));
router.get('/entries/expenses', auth, requireAdmin, getAllEntries(Expense, 'expenses'));
router.get('/entries/attendance', auth, requireAdmin, getAllEntries(Attendance, 'attendance'));
router.get('/entries/placements', auth, requireAdmin, getAllEntries(Placement, 'placements'));

module.exports = router;