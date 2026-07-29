const mongoose = require('mongoose');

const examSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  subject: { type: String, required: true },
  examType: { type: String, enum: ['quiz', 'midterm', 'final', 'practical', 'oral', 'other'], required: true },
  examDate: { type: Date, required: true },
  duration: Number,
  venue: String,
  maxMarks: Number,
  marksObtained: Number,
  grade: String,
  percentage: Number,
  status: { type: String, enum: ['upcoming', 'ongoing', 'completed', 'cancelled'], default: 'upcoming' },
  syllabus: String,
  notes: String,
  semester: String,
  reminder: Date
}, { timestamps: true });

module.exports = mongoose.model('Exam', examSchema);
