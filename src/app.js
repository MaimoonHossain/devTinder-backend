const express = require('express');
const connectDB = require('./config/database'); // Ensure this is the correct path to your database config
const app = express();

connectDB()
  .then(() => {
    console.log('Connected to MongoDB successfully!');
    // Start your server here
    const PORT = process.env.SERVER_PORT || 3000;
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT} 🚀`);
    });
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB:', error);
  });
