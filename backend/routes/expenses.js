const express = require('express');
const auth = require('../middleware/auth');
const Expense = require('../models/Expense');

const router = express.Router();

router.get('/', auth, async (req, res) => {
  try {
    const query = { user: req.user._id };
    if (req.query.category) query.category = req.query.category;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const [expenses, totalCount, totalAmountResult] = await Promise.all([
      Expense.find(query).sort({ date: -1 }).skip(skip).limit(limit),
      Expense.countDocuments(query),
      Expense.aggregate([{ $match: query }, { $group: { _id: null, total: { $sum: '$amount' } } }])
    ]);
    const totalAmount = totalAmountResult.length > 0 ? totalAmountResult[0].total : 0;
    res.json({ expenses, totalPages: Math.ceil(totalCount / limit), currentPage: page, totalCount, totalAmount });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.get('/stats', auth, async (req, res) => {
  try {
    const categoryStats = await Expense.aggregate([
      { $match: { user: req.user._id } },
      { $group: { _id: '$category', total: { $sum: '$amount' }, count: { $sum: 1 } } }
    ]);
    const monthlyStats = await Expense.aggregate([
      { $match: { user: req.user._id } },
      { $group: { _id: { year: { $year: '$date' }, month: { $month: '$date' } }, total: { $sum: '$amount' } } },
      { $sort: { '_id.year': -1, '_id.month': -1 } }
    ]);
    res.json({ categoryStats, monthlyStats });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const expense = await Expense.findOne({ _id: req.params.id, user: req.user._id });
    if (!expense) return res.status(404).json({ message: 'Expense not found' });
    res.json(expense);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.post('/', auth, async (req, res) => {
  try {
    const expense = new Expense({ ...req.body, user: req.user._id });
    await expense.save();
    res.status(201).json({ message: 'Expense created', expense });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const expense = await Expense.findOneAndUpdate({ _id: req.params.id, user: req.user._id }, req.body, { new: true });
    if (!expense) return res.status(404).json({ message: 'Expense not found' });
    res.json({ message: 'Expense updated', expense });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const expense = await Expense.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!expense) return res.status(404).json({ message: 'Expense not found' });
    res.json({ message: 'Expense deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
