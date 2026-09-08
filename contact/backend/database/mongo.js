const mongoose = require('mongoose');

const uri = process.env.MONGO_URI || process.env.MONGODB_URI;

async function init() {
  try {
    await mongoose.connect(uri);
    console.log('✅ Connected to MongoDB');
  } catch (err) {
    console.error('❌ MongoDB connection error:', err);
    throw err;
  }
}

module.exports = { init, mongoose };
