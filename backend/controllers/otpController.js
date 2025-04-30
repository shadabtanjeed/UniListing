const OTP = require('../models/otp_model');
const User_Demo = require('../models/users_demo');
const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';

// Configure nodemailer
const transporter = nodemailer.createTransport({
    service: 'yahoo',
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});

// Generate a random 6-digit OTP
const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP to user's email
const sendOTP = async (req, res) => {
    try {
        const { email, firstName, lastName, username, password } = req.body;

        // Validate input
        if (!email || !firstName || !lastName || !username || !password) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        // Check if email or username already exists
        const existingUser = await User_Demo.findOne({ $or: [{ email }, { username }] });
        if (existingUser) {
            return res.status(409).json({ message: 'Email or username already exists' });
        }

        // Generate OTP
        const otp = generateOTP();

        // Save OTP to database - overwrite if already exists
        await OTP.findOneAndUpdate(
            { email },
            {
                email,
                otp,
                verified: false,
                createdAt: new Date() // Reset expiry time
            },
            { upsert: true, new: true }
        );

        // Send email with OTP
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'UniListing - Email Verification OTP',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
                    <h2 style="color: #2d4f8f; text-align: center;">UniListing Email Verification</h2>
                    <p>Hello ${firstName} ${lastName},</p>
                    <p>Thank you for registering with UniListing. Please use the following OTP to verify your email address:</p>
                    <div style="text-align: center; padding: 10px;">
                        <h3 style="letter-spacing: 3px; font-size: 24px; background-color: #f5f5f5; padding: 10px; border-radius: 5px;">${otp}</h3>
                    </div>
                    <p>This OTP will expire in 10 minutes.</p>
                    <p>If you didn't request this, please ignore this email.</p>
                    <p>Regards,<br>UniListing Team</p>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);


        req.session.tempUser = {
            firstName,
            lastName,
            email,
            username,
            password
        };

        res.status(200).json({ message: 'OTP sent to your email', email });

    } catch (error) {
        console.error('Error sending OTP:', error);
        res.status(500).json({ message: 'Failed to send OTP' });
    }
};

const verifyOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({ message: 'Email and OTP are required' });
        }


        const otpRecord = await OTP.findOne({ email });

        if (!otpRecord) {
            return res.status(404).json({ message: 'OTP not found or expired. Please request a new OTP.' });
        }


        if (otpRecord.otp !== otp) {
            return res.status(401).json({ message: 'Invalid OTP' });
        }

        // Mark as verified
        otpRecord.verified = true;
        await otpRecord.save();

        res.status(200).json({ message: 'OTP verified successfully', verified: true });

    } catch (error) {
        console.error('Error verifying OTP:', error);
        res.status(500).json({ message: 'Failed to verify OTP' });
    }
};

const completeRegistration = async (req, res) => {
    try {
        const { email, firstName, lastName, username, password } = req.body;

        // Check if all required fields are provided
        if (!email || !firstName || !lastName || !username || !password) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        // Check if OTP was verified
        const otpRecord = await OTP.findOne({ email, verified: true });
        if (!otpRecord) {
            return res.status(401).json({ message: 'Email not verified. Please complete verification first.' });
        }

        // Check if user already exists
        const existingUser = await User_Demo.findOne({ $or: [{ email }, { username }] });
        if (existingUser) {
            return res.status(409).json({ message: 'Email or username already exists' });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create a new user
        const newUser = new User_Demo({
            firstName,
            lastName,
            email,
            username,
            password: hashedPassword
        });

        // Save the user
        await newUser.save();

        // Generate JWT token
        const token = jwt.sign({ id: newUser._id, username: newUser.username }, JWT_SECRET, {
            expiresIn: '1h'
        });

        // Set cookie
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 3600000 // 1 hour
        });

        // Delete the OTP record
        await OTP.deleteOne({ email });

        res.status(201).json({ message: 'User registered successfully' });

    } catch (error) {
        console.error('Error completing registration:', error);
        res.status(500).json({ message: 'Registration failed' });
    }
};


const resendOTP = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ message: 'Email is required' });
        }

        // Generate new OTP
        const otp = generateOTP();

        // Update OTP in database
        const result = await OTP.findOneAndUpdate(
            { email },
            {
                email,
                otp,
                verified: false,
                createdAt: new Date()
            },
            { upsert: true, new: true }
        );

        if (!result) {
            return res.status(404).json({ message: 'Email not found' });
        }

        // Send email with new OTP
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'UniListing - Email Verification OTP (Resend)',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
                    <h2 style="color: #2d4f8f; text-align: center;">UniListing Email Verification</h2>
                    <p>Hello,</p>
                    <p>You requested a new OTP. Please use the following OTP to verify your email address:</p>
                    <div style="text-align: center; padding: 10px;">
                        <h3 style="letter-spacing: 3px; font-size: 24px; background-color: #f5f5f5; padding: 10px; border-radius: 5px;">${otp}</h3>
                    </div>
                    <p>This OTP will expire in 10 minutes.</p>
                    <p>If you didn't request this, please ignore this email.</p>
                    <p>Regards,<br>UniListing Team</p>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);

        res.status(200).json({ message: 'New OTP sent to your email' });

    } catch (error) {
        console.error('Error resending OTP:', error);
        res.status(500).json({ message: 'Failed to resend OTP' });
    }
};

module.exports = {
    sendOTP,
    verifyOTP,
    completeRegistration,
    resendOTP
};