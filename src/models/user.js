const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const bcrypt = require('bcrypt');
dotenv.config(); // Load environment variables from .env file

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      minLength: 3,
      maxLength: 10,
    },
    lastName: {
      type: String,
      required: true,
    },
    emailId: {
      type: String,
      lowercase: true,
      required: true,
      unique: true,
      trim: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error('Email is invalid');
        }
      },
    },
    password: {
      type: String,
      required: true,
    },
    age: {
      type: Number,
      required: true,
      min: 18,
    },
    gender: {
      type: String,
      required: true,
      validate(value) {
        if (!['male', 'female', 'others'].includes(value.toLowerCase())) {
          throw new Error('Gender data is invalid');
        }
      },
    },
    photoUrl: {
      type: String,
      default: 'https://example.com/default-profile-pic.jpg',
    },
    about: {
      type: String,
      default: 'No bio provided',
    },
    skills: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

userSchema.index({ firstName: 1, lastName: 1 }, { unique: true });

userSchema.methods.getJWT = async function () {
  const user = this;

  const token = await jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
    expiresIn: '1h',
  });
  return token;
};

userSchema.methods.validatePassword = async function (passwordInputByUser) {
  const user = this;
  const passwordHash = user.password;

  const isPasswordValid = bcrypt.compareSync(passwordInputByUser, passwordHash);

  return isPasswordValid;
};

module.exports = mongoose.model('User', userSchema);
