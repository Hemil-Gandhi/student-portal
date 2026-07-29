const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  description: String,
  priority: { type: String, enum: ['low', 'medium', 'high', 'urgent'], default: 'medium' },
  status: { type: String, enum: ['pending', 'in-progress', 'completed', 'cancelled'], default: 'pending' },
  dueDate: Date,
  category: { type: String, enum: ['academic', 'personal', 'project', 'assignment', 'exam', 'other'], default: 'other' },
  tags: [String],
  completedAt: Date,
  reminder: Date
}, { timestamps: true });

module.exports = mongoose.model('Task', taskSchema);
