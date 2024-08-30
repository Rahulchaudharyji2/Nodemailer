const express = require('express');
const router = express.Router();
const { requestOTP, validateOTP } = require('../controllers/authController');

router.post('/send-otp', requestOTP);
router.post('/validate-otp', validateOTP);

module.exports = router;
