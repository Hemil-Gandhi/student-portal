const express = require('express');
const auth = require('../middleware/auth');
const Note = require('../models/Note');
const Notification = require('../models/Notification');
const { sendNoteNotification } = require('../services/email.service');

const router = express.Router();

router.get('/', auth, async (req, res) => {
  try {
    const query = { user: req.user._id };
    if (req.query.isFavorite) query.isFavorite = true;
    if (req.query.subject) query.subject = req.query.subject;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const [notes, totalCount] = await Promise.all([
      Note.find(query).sort({ updatedAt: -1 }).skip(skip).limit(limit),
      Note.countDocuments(query)
    ]);
    res.json({ notes, totalPages: Math.ceil(totalCount / limit), currentPage: page, totalCount });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.post('/', auth, async (req, res) => {
  try {
    const note = new Note({ ...req.body, user: req.user._id });
    await note.save();

    const prefs = req.user.notificationPreferences || {};
    if (prefs.emailEnabled && prefs.onNoteCreated) {
      const sent = await sendNoteNotification(req.user, note);
      await Notification.create({
        user: req.user._id,
        type: 'note_created',
        title: `New note: ${note.title}`,
        message: `Note "${note.title}" was created.`,
        referenceId: note._id,
        referenceModel: 'Note',
        emailSent: sent,
        emailError: sent ? undefined : 'Failed to send'
      });
    }

    res.status(201).json({ message: 'Note created', note });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const note = await Note.findOneAndUpdate({ _id: req.params.id, user: req.user._id }, req.body, { new: true });
    if (!note) return res.status(404).json({ message: 'Note not found' });
    res.json({ message: 'Note updated', note });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const note = await Note.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!note) return res.status(404).json({ message: 'Note not found' });
    res.json({ message: 'Note deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
