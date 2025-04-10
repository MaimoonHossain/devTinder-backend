const mongoose = require('mongoose');
const validator = require('validator');

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
      validate(value) {
        if (!validator.isURL(value)) {
          throw new Error('Invalid URL format for photoUrl');
        }
      },
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

module.exports = mongoose.model('User', userSchema);
