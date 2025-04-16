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

userRouter.get('/feed', userAuth, async (req, res) => {
  try {
    // Already connected poeples, own card and who was ignored or requested already.
    // User should see all the user cards except
    // 0. his own card
    // 1. his connections
    // 2. Already ignored people
    // 3. already sent the connection request
    const loggedInUser = req.user;
    const skip = parseInt(req.query.skip) || 0;
    let limit = parseInt(req.query.limit) || 10;
    limit = Math.min(limit, 50); // Limit to a maximum of 100

    // Find all connection requests (sent + received)
    const connectionRequests = await ConnectionRequest.find({
      $or: [{ fromUserId: loggedInUser._id }, { toUserId: loggedInUser._id }],
    }).select('fromUserId toUserId status');

    const hideUsersFromFeed = new Set();

    connectionRequests.forEach((request) => {
      hideUsersFromFeed.add(request.fromUserId.toString());
      hideUsersFromFeed.add(request.toUserId.toString());
    });

    const query = {
      $and: [
        { _id: { $nin: Array.from(hideUsersFromFeed) } },
        { _id: { $ne: loggedInUser._id } },
      ],
    };

    const [users, totalCount] = await Promise.all([
      User.find(query).select(USER_SAFE_FIELDS).limit(limit).skip(skip),
      User.countDocuments(query),
    ]);

    res.send({
      message: users.length > 0 ? 'Users found.' : 'No users found.',
      users,
      totalCount,
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

module.exports = userRouter;
