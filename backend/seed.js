const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./models/User');

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/student-portal');
    
    const existing = await User.findOne({ email: 'hemilgandhi904@gmail.com' });
    if (existing) {
      existing.role = 'admin';
      existing.password = 'Hemil@5114';
      await existing.save();
      console.log('Admin user updated: hemilgandhi904@gmail.com');
    } else {
      await User.create({
        name: 'Hemil Gandhi',
        email: 'hemilgandhi904@gmail.com',
        password: 'Hemil@5114',
        role: 'admin'
      });
      console.log('Admin user created: hemilgandhi904@gmail.com');
    }
    
    console.log('Seed complete');
    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err);
    process.exit(1);
  }
}

seed();
