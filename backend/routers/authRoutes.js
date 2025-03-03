const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const nodemailer = require('nodemailer');
const User = require("../models/User");

const router = express.Router();
const SECRET_KEY = "your_secret_key"; // Change this in production

// Register Route
router.post("/register", async (req, res) => {
    const { username, password } = req.body;

    try {
        const existingUser = await User.findOne({ username });
        if (existingUser) return res.status(400).json({ message: "Username already exists" });

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ username, password: hashedPassword });
        await newUser.save();

        res.json({ message: "User registered successfully" });
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
});

// Login Route
router.post("/login", async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await User.findOne({ username });
        if (!user) return res.status(400).json({ message: "User not found" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

        const token = jwt.sign({ id: user._id }, SECRET_KEY, { expiresIn: "1h" });
        res.json({ message: "Login successful", token });
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
});
const otpStorage = {};

// Configure Google OAuth
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/api/auth/google/callback"
}, async (accessToken, refreshToken, profile, done) => {
    let user = await User.findOne({ email: profile.emails[0].value });

    if (!user) {
        user = new User({
            username: profile.displayName,
            email: profile.emails[0].value,
            password: null,
        });
        await user.save();
    }
    return done(null, user);
}));

// Nodemailer Transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});
router.post('/send-otp', async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ error: 'Email is required' });
        }

        // Generate a 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000);
        otpStorage[email] = { otp, expires: Date.now() + 2 * 60 * 1000 }; // OTP expires in 2 minutes

        // Send OTP via email
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Your OTP for Registration',
            text: `Your OTP is ${otp}. It expires in 2 minutes.`,
        });

        res.json({ message: 'OTP sent successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to send OTP' });
    }
});

// verify otp
router.post('/verify-otp', async (req, res) => {
    try {
        const { email, otp, username, password, phone, address, gender } = req.body;

        console.log("Received Data:", req.body);  // Debugging
        console.log("Stored OTP for", email, ":", otpStorage[email]);

        if (!otpStorage[email]) {
            return res.status(400).json({ error: 'OTP not found or expired' });
        }

        const receivedOtp = parseInt(otp, 10);
        const storedOtp = otpStorage[email].otp;
        const expiryTime = otpStorage[email].expires;

        if (storedOtp !== receivedOtp) {
            return res.status(400).json({ error: 'Invalid OTP' });
        }

        if (Date.now() > expiryTime) {
            delete otpStorage[email];
            return res.status(400).json({ error: 'OTP has expired' });
        }

        console.log("Saving to DB:", { username, email, phone, address, gender });

        // Hash password and save user
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({
            username,
            email,
            password: hashedPassword,
            phone,
            address,
            gender
        });

        await newUser.save();
        delete otpStorage[email];

        console.log("User saved successfully");
        res.status(201).json({ message: 'Registration successful' });

    } catch (err) {
        console.error("Error saving user:", err);
        res.status(500).json({ error: 'Server error' });
    }
});





// Google OAuth Routes
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback', passport.authenticate('google', { session: false }), (req, res) => {
    const token = jwt.sign({ id: req.user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.redirect(`http://localhost:3000?token=${token}`);
});

router.post('/admin-login', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    try {
        const admin = await Admin.findOne({ username });
        if (!admin) {
            return res.status(401).json({ success: false, message: 'Invalid username or password' });
        }

        // Plaintext password check instead of bcrypt
        if (password !== admin.password) {
            return res.status(401).json({ success: false, message: 'Invalid username or password' });
        }

        // Generate a JWT token
        const token = jwt.sign(
            { id: admin._id },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '1h' }
        );

        res.status(200).json({
            success: true,
            token,
            admin: {
                id: admin._id,
                username: admin.username,
            },
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }

});
//
module.exports = router;
