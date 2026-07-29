const express = require('express');
const auth = require('../middleware/auth');
const Attendance = require('../models/Attendance');

const router = express.Router();

router.get('/', auth, async (req, res) => {
  try {
    const query = { user: req.user._id };
    if (req.query.subject) query.subject = req.query.subject;
    if (req.query.status) query.status = req.query.status;
    const attendance = await Attendance.find(query).sort({ date: -1 });
    res.json(attendance);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.get('/stats', auth, async (req, res) => {
  try {
    const attendance = await Attendance.find({ user: req.user._id });
    const summary = { present: 0, absent: 0, late: 0, excused: 0, total: attendance.length };
    attendance.forEach(a => { if (summary[a.status] !== undefined) summary[a.status]++; });
    const percentage = attendance.length > 0 ? Math.round(((summary.present + summary.late) / attendance.length) * 100) : 0;
    const subjectWise = await Attendance.aggregate([
      { $match: { user: req.user._id } },
      { $group: { _id: '$subject', present: { $sum: { $cond: [{ $in: ['$status', ['present', 'late']] }, 1, 0] } }, total: { $sum: 1 } } }
    ]);
    res.json({ summary, percentage, subjectWise });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.post('/', auth, async (req, res) => {
  try {
    const attendance = new Attendance({ ...req.body, user: req.user._id });
    await attendance.save();
    res.status(201).json({ message: 'Attendance created', attendance });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const attendance = await Attendance.findOneAndUpdate({ _id: req.params.id, user: req.user._id }, req.body, { new: true });
    if (!attendance) return res.status(404).json({ message: 'Attendance not found' });
    res.json({ message: 'Attendance updated', attendance });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const attendance = await Attendance.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!attendance) return res.status(404).json({ message: 'Attendance not found' });
    res.json({ message: 'Attendance deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
