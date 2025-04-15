const mongoose = require('mongoose');

const connectionRequestSchema = new mongoose.Schema(
  {
    fromUserId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    toUserId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    status: {
      type: String,
      required: true,
      enum: {
        values: ['ignored', 'interested', 'accepted', 'rejected'],
        message:
          '{VALUE} is not a valid status. Valid statuses are: ignored, interested, accepted, rejected',
      },
    },
  },
  { timestamps: true }
);

connectionRequestSchema.index({ fromUserId: 1, toUserId: 1 }, { unique: true });

// Add a pre-save hook to check for duplicate requests
connectionRequestSchema.pre('save', async function (next) {
  try {
    const connectionRequest = this;
    const { fromUserId, toUserId } = connectionRequest;

    // ✅ Prevent duplicate requests (both directions)
    const isDuplicate = await connectionRequest.constructor.findOne({
      $or: [
        { fromUserId, toUserId },
        { fromUserId: toUserId, toUserId: fromUserId },
      ],
      _id: { $ne: connectionRequest._id },
    });

    if (isDuplicate) {
      return next(new Error('Connection request already exists'));
    }

    // ✅ Prevent self requests
    if (fromUserId.toString() === toUserId.toString()) {
      return next(
        new Error('You cannot send a connection request to yourself')
      );
    }

    // ✅ All good
    next();
  } catch (err) {
    next(err);
  }
});

const ConnectionRequest = mongoose.model(
  'ConnectionRequest',
  connectionRequestSchema
);

module.exports = ConnectionRequest;
