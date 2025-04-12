const express = require('express');
const { validateSignUpData } = require('../utils/validation');
const User = require('../models/user');
const dotenv = require('dotenv');
dotenv.config(); // Load environment variables from .env file
const bcrypt = require('bcrypt');

const authRouter = express.Router();

authRouter.post('/signup', async (req, res) => {
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
      about: data.about,
    });
    const savedUser = await user.save();
    res.status(201).json(savedUser);
  } catch (error) {
    console.error('Error saving user:', error);
    res.status(400).json({ message: error.message });
  }
});

authRouter.post('/login', async (req, res) => {
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

authRouter.get('/logout', (req, res) => {
  res.clearCookie('token'); // Clear the cookie
  res.status(200).json({ message: 'Logout successful!' });
});

module.exports = authRouter;
