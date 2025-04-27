const express = require('express');
const { validateSignUpData } = require('../utils/validation');
const User = require('../models/user');
const dotenv = require('dotenv');
dotenv.config(); // Load environment variables from .env file
const bcrypt = require('bcrypt');
const upload = require('../middlewares/upload');
const joinUrl = require('../utils/joinUrl');

const authRouter = express.Router();

authRouter.post('/signup', upload.single('photoUrl'), async (req, res) => {
  try {
    const data = req.body;
    console.log('Received data:', data);

    const file = req.file;

    // Validate basic required fields
    validateSignUpData(data);

    const passwordHash = await bcrypt.hash(data.password, 10);

    // Prepare the new user object
    const newUser = new User({
      firstName: data.firstName,
      lastName: data.lastName,
      emailId: data.emailId.toLowerCase(),
      password: passwordHash,
      age: Number(data.age),
      gender: data.gender.toLowerCase(),
      about: data.about || 'No bio provided',
      skills: data.skills
        ? data.skills.split(',').map((skill) => skill.trim())
        : [],
      photoUrl: file
        ? joinUrl(process.env.MEDIA_URL, 'uploads/' + file.filename)
        : 'https://example.com/default-profile-pic.jpg',
    });

    const savedUser = await newUser.save();

    // ⬇️ Generate JWT token
    const token = await savedUser.getJWT();

    // ⬇️ Set token in cookie
    res.cookie('token', token, {
      expires: new Date(Date.now() + 3600000), // 1 hour
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // Secure in production
      sameSite: 'strict',
    });

    const { _id, firstName, lastName, emailId, photoUrl, about, skills } =
      savedUser;

    // ⬇️ Send token + user info in response
    res.status(201).json({
      message: 'Signup Successful!',
      token,
      user: { _id, firstName, lastName, emailId, photoUrl, about, skills },
    });
  } catch (error) {
    console.error('Error during signup:', error);
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

      const { _id, firstName, lastName, emailId, photoUrl, about, skills } =
        user;

      return res.status(200).json({
        message: 'Login Successful!',
        user: { _id, firstName, lastName, emailId, photoUrl, about, skills },
      });
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
