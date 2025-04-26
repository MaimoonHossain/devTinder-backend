const express = require('express');
const { userAuth } = require('../middlewares/auth');
const { validateProfileEditData } = require('../utils/validation');
const upload = require('../middlewares/upload');

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

profileRouter.patch(
  '/profile/edit',
  userAuth,
  upload.single('photoUrl'),
  async (req, res) => {
    try {
      const loggedInUser = req.user;

      // Since it's multipart/form-data, now fields are inside req.body and file inside req.file
      const { firstName, lastName, emailId, about, skills } = req.body;

      if (!firstName || !lastName || !emailId) {
        throw new Error('Invalid profile edit data');
      }

      // Update fields
      if (firstName) loggedInUser.firstName = firstName;
      if (lastName) loggedInUser.lastName = lastName;
      if (emailId) loggedInUser.emailId = emailId;
      if (about) loggedInUser.about = about;
      if (skills)
        loggedInUser.skills = skills.split(',').map((skill) => skill.trim());

      // If a new photo was uploaded
      if (req.file) {
        // Save the file path (or a full URL if you're serving uploads via static route)
        loggedInUser.photoUrl = `/uploads/${req.file.filename}`;
      }

      const updatedUser = await loggedInUser.save();
      res.status(200).json(updatedUser);
    } catch (err) {
      console.error(err);
      res.status(400).json({ message: err.message });
    }
  }
);

module.exports = profileRouter;
