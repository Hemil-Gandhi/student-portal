const express = require('express');
const multer = require('multer');
const path = require('path');
const auth = require('../middleware/auth');
const Note = require('../models/Note');

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname);
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|pdf|doc|docx|txt|zip|rar|xlsx|csv|ppt|pptx/;
    const ext = path.extname(file.originalname).toLowerCase().slice(1);
    if (allowed.test(ext)) cb(null, true);
    else cb(new Error('File type not allowed'));
  }
});

router.post('/note/:noteId', auth, upload.single('file'), async (req, res) => {
  try {
    const note = await Note.findOne({ _id: req.params.noteId, user: req.user._id });
    if (!note) return res.status(404).json({ message: 'Note not found' });

    note.attachments.push({
      filename: req.file.filename,
      originalName: req.file.originalname,
      path: req.file.path,
      size: req.file.size,
      mimeType: req.file.mimetype
    });
    await note.save();

    res.json({ message: 'File uploaded', note });
  } catch (error) {
    res.status(500).json({ message: 'Upload failed', error: error.message });
  }
});

router.delete('/note/:noteId/:filename', auth, async (req, res) => {
  try {
    const note = await Note.findOne({ _id: req.params.noteId, user: req.user._id });
    if (!note) return res.status(404).json({ message: 'Note not found' });

    note.attachments = note.attachments.filter(a => a.filename !== req.params.filename);
    await note.save();
    res.json({ message: 'File removed', note });
  } catch (error) {
    res.status(500).json({ message: 'Error removing file', error: error.message });
  }
});

module.exports = router;