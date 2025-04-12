const express = require('express');

const { userAuth } = require('../middlewares/auth');

const requestRouter = express.Router();

requestRouter.post('/sendConnectionRequest', userAuth, async (req, res) => {
  console.log('Send Connection Request:', req.body);

  res.status(200).json({ message: 'Connection request sent!' });
});

module.exports = requestRouter;
