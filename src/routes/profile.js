const express = require('express');
const { userAuth } = require('../middlewares/auth');
const { validateProfileEditData } = require('../utils/validation');

const profileRouter = express.Router();

profileRouter.get('/profile/view', userAuth, async (req, res) => {
  try {
    const user = req.user;
    res.status(200).json(user);
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

profileRouter.patch('/profile/edit', userAuth, async (req, res) => {
  try {
    if (!validateProfileEditData(req.body)) {
      throw new Error('Invalid profile edit data');
    }

    const loggedInUser = req.user;

    Object.keys(req.body).forEach((key) => (loggedInUser[key] = req.body[key]));
    const updatedUser = await loggedInUser.save();
    res.status(200).json(updatedUser);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = profileRouter;
