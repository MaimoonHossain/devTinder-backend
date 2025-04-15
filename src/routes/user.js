const express = require('express');
const { userAuth } = require('../middlewares/auth');
const ConnectionRequest = require('../models/connectionRequest');
const User = require('../models/user');
const userRouter = express.Router();

// Get all the pending connection requests for the logged in user
userRouter.get('/user/requests/received', userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;

    const connectionRequests = await ConnectionRequest.find({
      toUserId: loggedInUser._id,
      status: 'interested',
    }).populate(
      'fromUserId',
      'firstName lastName photoUrl age gender about skills'
    );

    if (!connectionRequests || connectionRequests.length === 0) {
      return res.status(404).json({ message: 'No connection requests found.' });
    }

    return res
      .status(200)
      .json({ message: 'Connection requests found.', connectionRequests });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

module.exports = userRouter;
