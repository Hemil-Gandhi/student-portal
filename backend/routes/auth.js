const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Otp = require('../models/Otp');
const auth = require('../middleware/auth');
const { sendOtpEmail } = require('../services/email.service');

const router = express.Router();

router.post('/send-otp', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'Email already registered' });

    await Otp.deleteMany({ email, type: 'registration' });

    const otpCode = Math.floor(1000 + Math.random() * 9000).toString();
    await Otp.create({
      email,
      otp: otpCode,
      type: 'registration',
      expiresAt: new Date(Date.now() + 5 * 60 * 1000)
    });

    const sent = await sendOtpEmail(email, otpCode);
    if (!sent) return res.status(500).json({ message: 'Failed to send OTP email. Check your email configuration.' });

    res.json({ message: 'OTP sent to your email', expiresIn: 300 });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp, name, studentId, department, year } = req.body;
    if (!email || !otp) return res.status(400).json({ message: 'Email and OTP are required' });

    const otpRecord = await Otp.findOne({ email, type: 'registration', verified: false });
    if (!otpRecord) return res.status(400).json({ message: 'No OTP found. Please request a new one.' });

    if (new Date() > otpRecord.expiresAt) {
      await Otp.deleteMany({ email, type: 'registration' });
      return res.status(400).json({ message: 'OTP has expired. Please request a new one.' });
    }

    otpRecord.attempts += 1;
    if (otpRecord.attempts > 5) {
      await Otp.deleteMany({ email, type: 'registration' });
      return res.status(400).json({ message: 'Too many attempts. Please request a new OTP.' });
    }
    await otpRecord.save();

    if (otpRecord.otp !== otp) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    otpRecord.verified = true;
    await otpRecord.save();

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'Email already registered' });

    const tempPassword = Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
    const user = new User({ name, email, password: tempPassword, studentId, department, year });
    await user.save();

    await Otp.deleteMany({ email, type: 'registration' });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'student-portal-jwt-secret-key-2024', { expiresIn: '7d' });
    res.status(201).json({ 
      token, 
      needsPassword: true,
      user: { id: user._id, name: user.name, email: user.email, role: user.role, notificationPreferences: user.notificationPreferences }, 
      message: 'Email verified! Please set your password.' 
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.post('/set-password', auth, async (req, res) => {
  try {
    const { password } = req.body;
    if (!password || password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.password = password;
    await user.save();

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'student-portal-jwt-secret-key-2024', { expiresIn: '7d' });
    res.json({ 
      token, 
      user: { id: user._id, name: user.name, email: user.email, role: user.role, notificationPreferences: user.notificationPreferences },
      message: 'Password set successfully' 
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.post('/resend-otp', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });

    await Otp.deleteMany({ email, type: 'registration', verified: false });

    const otpCode = Math.floor(1000 + Math.random() * 9000).toString();
    await Otp.create({
      email,
      otp: otpCode,
      type: 'registration',
      expiresAt: new Date(Date.now() + 5 * 60 * 1000)
    });

    const sent = await sendOtpEmail(email, otpCode);
    if (!sent) return res.status(500).json({ message: 'Failed to send OTP email' });

    res.json({ message: 'New OTP sent to your email', expiresIn: 300 });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.post('/register', async (req, res) => {
  try {
    const { name, email, password, studentId, department, year } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'Email already in use' });
    const user = new User({ name, email, password, studentId, department, year });
    await user.save();
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'student-portal-jwt-secret-key-2024', { expiresIn: '7d' });
    res.status(201).json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role, notificationPreferences: user.notificationPreferences }, message: 'Registration successful' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });
    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'student-portal-jwt-secret-key-2024', { expiresIn: '7d' });
    res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role, studentId: user.studentId, department: user.department, year: user.year, notificationPreferences: user.notificationPreferences }, message: 'Login successful' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.get('/me', auth, async (req, res) => {
  res.json({ user: req.user });
});

router.put('/profile', auth, async (req, res) => {
  try {
    const { name, studentId, department, year } = req.body;
    const user = await User.findByIdAndUpdate(req.user._id, { name, studentId, department, year }, { new: true }).select('-password');
    res.json({ message: 'Profile updated', user });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.put('/change-password', auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id);
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) return res.status(400).json({ message: 'Current password is incorrect' });
    user.password = newPassword;
    await user.save();
    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
