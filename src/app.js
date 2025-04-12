const express = require('express');

const cookieParser = require('cookie-parser');
const connectDB = require('./config/database'); // Ensure this is the correct path to your database config
const User = require('./models/user');
const { validateSignUpData } = require('./utils/validation');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config(); // Load environment variables from .env file
const { userAuth } = require('./middlewares/auth');

const app = express();

app.use(express.json()); // Middleware to parse JSON requests
app.use(cookieParser()); // Middleware to parse cookies

app.post('/signup', async (req, res) => {
  const data = req.body;

  try {
    validateSignUpData(data);

    const passwordHash = await bcrypt.hash(data.password, 10);

    const user = new User({
      firstName: data.firstName,
      lastName: data.lastName,
      emailId: data.emailId,
      password: passwordHash,
      age: data.age,
      gender: data.gender,
      photoUrl: data.photoUrl,
      skills: data.skills,
    });
    const savedUser = await user.save();
    res.status(201).json(savedUser);
  } catch (error) {
    console.error('Error saving user:', error);
    res.status(400).json({ message: error.message });
  }
});

app.post('/login', async (req, res) => {
  try {
    const { emailId, password } = req.body;

    if (!emailId || !password) {
      return res
        .status(400)
        .json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ emailId });

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password!' });
    }

    // Compare the password with the hashed password in the database
    const isPasswordValid = await user.validatePassword(password);

    if (isPasswordValid) {
      // Set a cookie with the user ID (or any other identifier)
      const token = await user.getJWT();

      res.cookie('token', token, {
        expires: new Date(Date.now() + 3600000),
        httpOnly: true,
      });
      return res.status(200).json({ message: 'Login Successful!' });
    } else {
      return res.status(401).json({ message: 'Invalid credentials!' });
    }
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({ message: error.message });
  }
});

// Profile Api

app.get('/profile', userAuth, async (req, res) => {
  try {
    const user = req.user;
    res.status(200).json(user);
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.post('/sendConnectionRequest', userAuth, async (req, res) => {
  console.log('Send Connection Request:', req.body);

  res.status(200).json({ message: 'Connection request sent!' });
});

//Get user by email

app.get('/user', userAuth, async (req, res) => {
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
