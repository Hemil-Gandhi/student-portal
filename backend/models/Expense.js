const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  amount: { type: Number, required: true },
  category: { type: String, enum: ['food', 'transport', 'accommodation', 'books', 'fees', 'entertainment', 'medical', 'other'], required: true },
  date: { type: Date, required: true },
  description: String,
  paymentMethod: { type: String, enum: ['cash', 'card', 'upi', 'wallet', 'other'] },
  isRecurring: { type: Boolean, default: false },
  recurringFrequency: { type: String, enum: ['daily', 'weekly', 'monthly', 'yearly'] }
}, { timestamps: true });

module.exports = mongoose.model('Expense', expenseSchema);
