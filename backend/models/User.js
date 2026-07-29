const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  studentId: String,
  department: String,
  year: Number,
  avatar: String,
  role: { type: String, enum: ['student', 'admin'], default: 'student' },
  notificationPreferences: {
    emailEnabled: { type: Boolean, default: true },
    onTaskCreated: { type: Boolean, default: true },
    onNoteCreated: { type: Boolean, default: true },
    onTaskReminder: { type: Boolean, default: true }
  }
}, { timestamps: true });

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
