const mongoose = require('mongoose');

const placementSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  companyName: { type: String, required: true },
  role: { type: String, required: true },
  jobType: { type: String, enum: ['internship', 'full-time', 'part-time', 'contract', 'freelance'], required: true },
  status: { type: String, enum: ['applied', 'interviewing', 'offer-received', 'rejected', 'accepted', 'declined'], default: 'applied' },
  applicationDate: { type: Date, required: true },
  interviewDate: Date,
  ctc: Number,
  location: String,
  jobDescription: String,
  requirements: [String],
  notes: String,
  contactPerson: {
    name: String,
    email: String,
    phone: String
  },
  applicationLink: String
}, { timestamps: true });

module.exports = mongoose.model('Placement', placementSchema);
