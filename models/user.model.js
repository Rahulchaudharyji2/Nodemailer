const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true
  },
  otp: {
    type: String
  },
  otpExpiry: {
    type: Date
  }
});

const User = mongoose.model('User', userSchema);

module.exports = User;
