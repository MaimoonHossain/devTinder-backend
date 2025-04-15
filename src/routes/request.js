const express = require('express');
const { userAuth } = require('../middlewares/auth');
const ConnectionRequest = require('../models/connectionRequest');
const mongoose = require('mongoose');
const User = require('../models/user');

const requestRouter = express.Router();

requestRouter.post(
  '/request/send/:status/:toUserId',
  userAuth,
  async (req, res) => {
    try {
      const fromUserId = req.user._id;
      const toUserId = req.params.toUserId;
      const status = req.params.status;

      const validStatuses = ['ignored', 'interested'];

      if (!validStatuses.includes(status)) {
        return res.status(400).json({ message: `Invalid status ${status}` });
      }

      if (!mongoose.Types.ObjectId.isValid(toUserId)) {
        return res.status(400).json({ message: 'Invalid user ID' });
      }

      // Check if the connection request already exists
      const existingRequest = await ConnectionRequest.findOne({
        $or: [
          { fromUserId, toUserId },
          { fromUserId: toUserId, toUserId: fromUserId },
        ],
      });

      if (existingRequest) {
        return res.status(400).json({
          message: 'Connection request already exists',
        });
      }

      // Check if the user is trying to send a request to an invalid user
      const toUser = await User.findById(toUserId);
      if (!toUser) {
        return res.status(404).json({
          message: 'User not found',
        });
      }

      // Check if the user is trying to send a request to themselves
      if (fromUserId.toString() === toUserId.toString()) {
        return res.status(400).json({
          message: 'You cannot send a connection request to yourself',
        });
      }

      // Check if the user is trying to send a request to an already connected user

      const connectionRequest = new ConnectionRequest({
        fromUserId,
        toUserId,
        status,
      });

      const data = await connectionRequest.save();

      res.status(201).json({
        message:
          status === 'ignored'
            ? 'Connection request ignored'
            : 'Connection request sent',
        data,
      });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
);

requestRouter.post(
  '/request/review/:status/:requestId',
  userAuth,
  async (req, res) => {
    try {
      const loggedInUser = req.user;
      const { status, requestId } = req.params;

      const allowedStatuses = ['accepted', 'rejected'];
      if (!allowedStatuses.includes(status)) {
        return res.status(400).json({
          message: `Invalid status ${status}. Allowed statuses are: ${allowedStatuses.join(
            ', '
          )}`,
        });
      }

      const connectionRequest = await ConnectionRequest.findOne({
        _id: requestId,
        toUserId: loggedInUser._id,
        status: 'interested',
      });

      if (!connectionRequest) {
        return res.status(404).json({ message: 'Request not found' });
      }

      connectionRequest.status = status;

      await connectionRequest.save();

      res.status(200).json({
        message: `Connection request ${status}`,
        loggedInUser,
        connectionRequest,
      });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
);

module.exports = requestRouter;
