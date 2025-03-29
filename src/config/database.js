const mongoose = require('mongoose');
require('dotenv').config(); // Load environment variables from .env file

const { DB_URI } = process.env;

const connectDB = async () => {
  try {
    await mongoose.connect(DB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected successfully ✅');
  } catch (error) {
    console.error('MongoDB connection error ❌:', error);
    process.exit(1); // Exit the process with failure
  }
};

module.exports = connectDB;
