const express = require('express');
const validator = require('validator');
const connectDB = require('./config/database'); // Ensure this is the correct path to your database config
const User = require('./models/user');
const app = express();

app.use(express.json()); // Middleware to parse JSON requests

app.post('/signup', async (req, res) => {
  const data = req.body;

  const user = new User(data);
  try {
    const savedUser = await user.save();
    res.status(201).json(savedUser);
  } catch (error) {
    console.error('Error saving user:', error);
    res.status(500).json({ message: 'Internal server error', error });
  }
});

//Get user by email

app.get('/user', async (req, res) => {
  const emailId = req.body.emailId;

  console.log('Email ID:', emailId);

  if (!emailId) {
    return res.status(400).json({ message: 'Email ID is required' });
  }

  try {
    const user = await User.findOne({ emailId });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.get('/feed', async (req, res) => {
  try {
    const users = await User.find({});
    res.status(200).json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.delete('/user', async (req, res) => {
  const userId = req.body.userId;
  try {
    const user = await User.findByIdAndDelete(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: error });
  }
});

app.patch('/user/:userId', async (req, res) => {
  const userId = req.params?.userId;
  const data = req.body;

  const allowedUpdates = [
    'firstName',
    'lastName',
    'password',
    'age',
    'photoUrl',
    'skills',
  ];

  const isValidOperation = Object.keys(data).every((update) =>
    allowedUpdates.includes(update)
  );
  if (!isValidOperation) {
    return res.status(400).json({ message: 'Invalid updates!' });
  }

  if (data?.skills.length > 5) {
    return res.status(400).json({ message: 'Skills should not exceed 5' });
  }

  if (data?.age < 18) {
    return res.status(400).json({ message: 'Age should be 18 or above' });
  }

  try {
    const updatedUser = await User.findByIdAndUpdate({ _id: userId }, data, {
      new: true,
      runValidators: true,
    });
    res.status(200).json({ message: 'User updated successfully', updatedUser });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: error });
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
