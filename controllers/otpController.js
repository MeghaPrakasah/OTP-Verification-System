// controllers/otpController.js
const Otp = require('../models/Otp');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

// Function to generate OTP
const generateOtp = () => crypto.randomInt(100000, 999999).toString();

// Nodemailer configuration
const transporter = nodemailer.createTransport({
    service: 'gmail', // Use your email provider
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

exports.sendOtp = async (req, res) => {
    const { email } = req.body;
    const otp = generateOtp();

    try {
        await Otp.deleteMany({ email }); // Remove old OTP if exists
        const otpRecord = new Otp({ email, otp });
        await otpRecord.save();

        // Send OTP via email
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Your OTP Code',
            text: `Your OTP code is ${otp}`,
        });

        res.status(200).json({ message: 'OTP sent successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error sending OTP', error });
    }
};

exports.verifyOtp = async (req, res) => {
    const { email, otp } = req.body;

    try {
        const otpRecord = await Otp.findOne({ email, otp });

        if (!otpRecord) {
            return res.status(400).json({ message: 'Invalid OTP or OTP expired' });
        }

        await Otp.deleteOne({ email, otp }); // Remove OTP after verification

        res.status(200).json({ message: 'OTP verified successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error verifying OTP', error });
    }
};
