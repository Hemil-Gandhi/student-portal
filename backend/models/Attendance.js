const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  subject: { type: String, required: true },
  date: { type: Date, required: true },
  status: { type: String, enum: ['present', 'absent', 'late', 'excused'], required: true },
  totalClasses: Number,
  attendedClasses: Number,
  notes: String,
  semester: String
}, { timestamps: true });

module.exports = mongoose.model('Attendance', attendanceSchema);
