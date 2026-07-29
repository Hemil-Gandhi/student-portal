require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');

const authRoutes = require('./routes/auth');
const dashboardRoutes = require('./routes/dashboard');
const attendanceRoutes = require('./routes/attendance');
const taskRoutes = require('./routes/tasks');
const examRoutes = require('./routes/exams');
const noteRoutes = require('./routes/notes');
const expenseRoutes = require('./routes/expenses');
const placementRoutes = require('./routes/placements');
const notificationRoutes = require('./routes/notifications');
const adminRoutes = require('./routes/admin');
const uploadRoutes = require('./routes/upload');
const cron = require('node-cron');
const Task = require('./models/Task');
const Notification = require('./models/Notification');
const User = require('./models/User');
const { sendTaskReminder } = require('./services/email.service');

const app = express();
const PORT = process.env.PORT || 3002;

const allowedOrigins = [
  'http://localhost:4200',
  'https://frontend-ten-mauve-88.vercel.app'
];
if (process.env.ALLOWED_ORIGIN) {
  allowedOrigins.push(process.env.ALLOWED_ORIGIN);
}
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(null, true); // Allow all for now; tighten later if needed
    }
  },
  credentials: true
};
app.use(cors(corsOptions));
app.use(express.json());
app.use(morgan('dev'));

let mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/student-portal';

mongoose.connect(mongoUri, {
  serverSelectionTimeoutMS: 5000
}).then(() => {
  console.log('Connected to MongoDB');
  startReminderCron();
}).catch(async err => {
  console.error('MongoDB connection error:', err.message);
  console.log('Attempting to start in-memory MongoDB as fallback...');
  try {
    const { MongoMemoryServer } = require('mongodb-memory-server');
    const mongoServer = await MongoMemoryServer.create();
    const fallbackUri = mongoServer.getUri();
    await mongoose.connect(fallbackUri);
    console.log(`Connected to fallback In-Memory MongoDB at ${fallbackUri}`);
    startReminderCron();
  } catch (memErr) {
    console.error('Failed to start memory server:', memErr);
    process.exit(1);
  }
});

app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/exams', examRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/placements', placementRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/uploads', express.static('uploads'));

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

function startReminderCron() {
  cron.schedule('0 * * * *', async () => {
    console.log('Running task reminder check...');
    try {
      const now = new Date();
      const in24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      const tasksDueSoon = await Task.find({
        status: { $ne: 'completed' },
        dueDate: { $gte: now, $lte: in24Hours }
      }).populate('user');

      for (const task of tasksDueSoon) {
        if (!task.user) continue;
        const prefs = task.user.notificationPreferences || {};
        if (!prefs.emailEnabled || !prefs.onTaskReminder) continue;

        const alreadyNotified = await Notification.findOne({
          user: task.user._id,
          referenceId: task._id,
          type: 'task_reminder'
        });
        if (alreadyNotified) continue;

        const sent = await sendTaskReminder(task.user, task);
        await Notification.create({
          user: task.user._id,
          type: 'task_reminder',
          title: `Task due soon: ${task.title}`,
          message: `"${task.title}" is due within 24 hours (${new Date(task.dueDate).toLocaleDateString()})`,
          referenceId: task._id,
          referenceModel: 'Task',
          emailSent: sent,
          emailError: sent ? undefined : 'Failed to send'
        });
      }
    } catch (error) {
      console.error('Reminder cron error:', error.message);
    }
  });
  console.log('Task reminder cron job scheduled (runs every hour)');
}

if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

module.exports = app;
