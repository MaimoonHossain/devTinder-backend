const express = require('express');
const { userAuth } = require('../middlewares/auth');

const profileRouter = express.Router();

profileRouter.get('/profile', userAuth, async (req, res) => {
  try {
    const user = req.user;
    res.status(200).json(user);
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = profileRouter;
