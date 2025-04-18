const express = require('express');
const cors = require('cors');

const cookieParser = require('cookie-parser');
const connectDB = require('./config/database'); // Ensure this is the correct path to your database config
const User = require('./models/user');
const { validateSignUpData } = require('./utils/validation');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config(); // Load environment variables from .env file
const { userAuth } = require('./middlewares/auth');
const authRouter = require('./routes/auth');
const profileRouter = require('./routes/profile');
const requestRouter = require('./routes/request');
const userRouter = require('./routes/user');
const user = require('./models/user');

const app = express();

app.use(
  cors({
    origin: 'http://localhost:3000',
    credentials: true,
  })
);

app.use(express.json()); // Middleware to parse JSON requests
app.use(cookieParser()); // Middleware to parse cookies

app.use('/', authRouter);
app.use('/', profileRouter);
app.use('/', requestRouter);
app.use('/', userRouter);

connectDB()
  .then(() => {
    console.log('Connected to MongoDB successfully!');
    // Start your server here
    const PORT = process.env.SERVER_PORT || 3000;
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT} 🚀`);
    });
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB:', error);
  });
