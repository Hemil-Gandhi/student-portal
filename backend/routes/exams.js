const express = require('express');
const auth = require('../middleware/auth');
const Exam = require('../models/Exam');

const router = express.Router();

router.get('/', auth, async (req, res) => {
  try {
    const query = { user: req.user._id };
    if (req.query.status) query.status = req.query.status;
    if (req.query.subject) query.subject = req.query.subject;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const [exams, totalCount] = await Promise.all([
      Exam.find(query).sort({ examDate: -1 }).skip(skip).limit(limit),
      Exam.countDocuments(query)
    ]);
    res.json({ exams, totalPages: Math.ceil(totalCount / limit), currentPage: page, totalCount });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.get('/stats', auth, async (req, res) => {
  try {
    const now = new Date();
    const exams = await Exam.find({ user: req.user._id });
    const totalExams = exams.length;
    const completed = exams.filter(e => e.status === 'completed' && e.percentage != null);
    const averagePercentage = completed.length > 0 ? Math.round(completed.reduce((s, e) => s + e.percentage, 0) / completed.length) : 0;
    const subjectWise = await Exam.aggregate([
      { $match: { user: req.user._id, status: 'completed' } },
      { $group: { _id: '$subject', avgPercentage: { $avg: '$percentage' }, examsCount: { $sum: 1 } } }
    ]);
    const upcomingCount = exams.filter(e => e.status === 'upcoming' && new Date(e.examDate) >= now).length;
    res.json({ totalExams, averagePercentage, subjectWise, upcomingCount });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.post('/', auth, async (req, res) => {
  try {
    const exam = new Exam({ ...req.body, user: req.user._id });
    await exam.save();
    res.status(201).json({ message: 'Exam created', exam });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const exam = await Exam.findOneAndUpdate({ _id: req.params.id, user: req.user._id }, req.body, { new: true });
    if (!exam) return res.status(404).json({ message: 'Exam not found' });
    res.json({ message: 'Exam updated', exam });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const exam = await Exam.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!exam) return res.status(404).json({ message: 'Exam not found' });
    res.json({ message: 'Exam deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
