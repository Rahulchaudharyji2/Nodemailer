const express = require('express');
const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const User = require('../models/user.model');
const winston = require('winston');

const OTP_EXPIRATION_TIME = 5 * 60 * 1000; // 5 minutes

// Create a Nodemailer transport
const transporter = nodemailer.createTransport({
  host: 'smtp.ethereal.email',
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  timeout: 60000 // increased timeout to 1 minute
});

// Function to generate OTP
function generateOTP(length = 6) {
  return crypto.randomInt(Math.pow(10, length - 1), Math.pow(10, length)).toString();
}

// Function to send OTP via email
async function sendOTPEmail(userEmail, otp) {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: userEmail,
      subject: 'Your OTP Code',
      text: `Your OTP code is: ${otp}`
    };

    console.log('Attempting to send email...');
    await transporter.sendMail(mailOptions);
    console.log('Email sent successfully!');
  } catch (error) {
    winston.error('Error sending OTP email:', error);
    console.error('Error details:', error.details);
    // ...
  }
}

// Function to validate email
function validateEmail(email) {
  if (!email || !email.trim()) {
    return false;
  }
  return true;
}

// Function to validate OTP
function validateOTP(otp) {
  if (!otp || !otp.trim()) {
    return false;
  }
  return true;
}

// Endpoint to request OTP
async function requestOTP(req, res) {
  try {
    const { email } = req.body;
    if (!validateEmail(email)) {
      return res.status(400).json({ message: 'Invalid email.' });
    }

    const otp = generateOTP();
    const otpExpiry = Date.now() + OTP_EXPIRATION_TIME;

    // Hash the OTP using bcrypt
    const hashedOtp = await bcrypt.hash(otp, 10);

    // Store OTP and expiry time in the database
    await User.findOneAndUpdate({ email }, { otp: hashedOtp, otpExpiry }, { upsert: true });

    // Send OTP to user's email
    await sendOTPEmail(email, otp);

    res.status(200).json({ message: 'OTP sent to your email.' });
  } catch (error) {
    if (error instanceof nodemailer.SendError) {
      // Handle email sending error
      res.status(500).json({ message: 'Error sending OTP email.' });
    } else {
      // Handle other errors
      res.status(500).json({ message: 'Internal Server Error.' });
    }
  }
}

// Endpoint to validate OTP
async function validateOTP(req, res) {
  try {
    const { email, otp } = req.body;
    if (!validateEmail(email) || !validateOTP(otp)) {
      return res.status(400).json({ message: 'Invalid input.' });
    }

    // Retrieve user by email
    const user = await User.findOne({ email });

    // Check if user exists and OTP is not expired
    if (!user || Date.now() > user.otpExpiry) {
      return res.status(400).json({ message: 'Invalid or expired OTP.' });
    }

    // Compare the submitted OTP with the stored hashed OTP
    const isValid = await bcrypt.compare(otp, user.otp);
    if (!isValid) {
      return res.status(400).json({ message: 'Invalid OTP.' });
    }

    // OTP is valid; proceed with authentication
    user.isAuthenticated = true; // Example: Update authentication status
    await user.save();

    res.status(200).json({ message: 'OTP validated successfully.' });
  } catch (error) {
    // Handle errors
    res.status(500).json({ message: 'Internal Server Error.' });
  }
}

module.exports = {
  requestOTP,
  validateOTP
};