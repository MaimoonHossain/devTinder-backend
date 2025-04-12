const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const User = require('../models/user');
dotenv.config(); // Load environment variables from .env file

const userAuth = async (req, res, next) => {
  // Read the token from the request header
  try {
    const cookies = req.cookies;
    const token = cookies.token;

    if (!token) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    // Validate the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Find the username
    const userId = decoded._id;
    // Check if the user exists in the database
    const user = await User.findById(userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    // Attach user information to the request object
    req.user = user;
    // Call the next middleware or route handler

    next();
  } catch (error) {
    console.error('Error in userAuth middleware:', error);
    return res.status(401).json({ message: 'Unauthorized' });
  }
};

module.exports = {
  userAuth,
};
