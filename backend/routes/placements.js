const express = require('express');
const auth = require('../middleware/auth');
const Placement = require('../models/Placement');

const router = express.Router();

router.get('/', auth, async (req, res) => {
  try {
    const query = { user: req.user._id };
    if (req.query.status) query.status = req.query.status;
    if (req.query.jobType) query.jobType = req.query.jobType;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const [placements, totalCount] = await Promise.all([
      Placement.find(query).sort({ applicationDate: -1 }).skip(skip).limit(limit),
      Placement.countDocuments(query)
    ]);
    res.json({ placements, totalPages: Math.ceil(totalCount / limit), currentPage: page, totalCount });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.get('/stats', auth, async (req, res) => {
  try {
    const statusStats = await Placement.aggregate([{ $match: { user: req.user._id } }, { $group: { _id: '$status', count: { $sum: 1 } } }]);
    const jobTypeStats = await Placement.aggregate([{ $match: { user: req.user._id } }, { $group: { _id: '$jobType', count: { $sum: 1 } } }]);
    const acceptedOffers = await Placement.find({ user: req.user._id, status: 'accepted' });
    const totalCTC = acceptedOffers.reduce((s, p) => s + (p.ctc || 0), 0);
    res.json({ statusStats, jobTypeStats, acceptedOffers, totalCTC, offersCount: acceptedOffers.length });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.post('/', auth, async (req, res) => {
  try {
    const placement = new Placement({ ...req.body, user: req.user._id });
    await placement.save();
    res.status(201).json({ message: 'Placement created', placement });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const placement = await Placement.findOneAndUpdate({ _id: req.params.id, user: req.user._id }, req.body, { new: true });
    if (!placement) return res.status(404).json({ message: 'Placement not found' });
    res.json({ message: 'Placement updated', placement });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const placement = await Placement.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!placement) return res.status(404).json({ message: 'Placement not found' });
    res.json({ message: 'Placement deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
