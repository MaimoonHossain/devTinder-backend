const express = require('express');
const connectDB = require('./config/database'); // Ensure this is the correct path to your database config
const User = require('./models/user');
const app = express();

app.post('/signup', async (req, res) => {
  const userObj = {
    firstName: 'Maimoon',
    lastName: 'Ali',
    emaildId: 'maimoon@gmail.com',
    password: '123456',
    gender: 'Male',
    age: 25,
  };

  const user = new User(userObj);

  try {
    const savedUser = await user.save();
    res.status(201).json(savedUser);
  } catch (error) {
    console.error('Error saving user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

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
