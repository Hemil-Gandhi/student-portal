const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['task_created', 'note_created', 'task_reminder', 'exam_reminder'], required: true },
  title: { type: String, required: true },
  message: String,
  referenceId: mongoose.Schema.Types.ObjectId,
  referenceModel: String,
  emailSent: { type: Boolean, default: false },
  emailError: String,
  read: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);