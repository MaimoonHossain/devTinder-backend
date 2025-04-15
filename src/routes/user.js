const express = require('express');
const { userAuth } = require('../middlewares/auth');
const ConnectionRequest = require('../models/connectionRequest');
const User = require('../models/user');
const userRouter = express.Router();

const USER_SAFE_FIELDS = 'firstName lastName photoUrl age gender about skills';

// Get all the pending connection requests for the logged in user
userRouter.get('/user/requests/received', userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;

    const connectionRequests = await ConnectionRequest.find({
      toUserId: loggedInUser._id,
      status: 'interested',
    }).populate('fromUserId', USER_SAFE_FIELDS);

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

userRouter.get('/user/connections', userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;

    const connections = await ConnectionRequest.find({
      $or: [
        { fromUserId: loggedInUser._id, status: 'accepted' },
        { toUserId: loggedInUser._id, status: 'accepted' },
      ],
    })
      .populate('fromUserId', USER_SAFE_FIELDS)
      .populate('toUserId', USER_SAFE_FIELDS);

    if (!connections || connections.length === 0) {
      return res.status(404).json({ message: 'No connections found.' });
    }

    // Filter out the logged-in user from the connections
    const filteredConnections = connections.map((connection) => {
      if (
        connection.fromUserId._id.toString() === loggedInUser._id.toString()
      ) {
        return connection.toUserId;
      }
      return connection.fromUserId;
    });

    return res
      .status(200)
      .json({ message: 'Connections found.', filteredConnections });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

module.exports = userRouter;
