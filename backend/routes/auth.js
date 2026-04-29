const router = require('express').Router();
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Admin = require('../models/Admin');
const Officer = require('../models/Officer');
const nodemailer = require('nodemailer');

const makeToken = (payload) => jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });

// Send OTP email — returns true if sent, false if email not configured
const sendOtpEmail = async (email, otp, name) => {
  try {
    if (!process.env.MAIL_USER || process.env.MAIL_USER === 'your_email@gmail.com') {
      console.log(`📧 OTP for ${email}: ${otp} (email not configured — returning OTP in response)`);
      return false;
    }
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: process.env.MAIL_USER, pass: process.env.MAIL_PASS },
    });
    
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaec; border-radius: 8px; background-color: #ffffff;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h2 style="color: #1a202c; margin-bottom: 8px;">Guntur Civic Portal</h2>
          <p style="color: #718096; font-size: 14px; margin: 0;">Account Verification</p>
        </div>
        <div style="padding: 24px; background-color: #f7fafc; border-radius: 6px; text-align: center;">
          <p style="color: #4a5568; font-size: 16px; margin-bottom: 16px;">Hello <strong>${name}</strong>,</p>
          <p style="color: #4a5568; font-size: 14px; margin-bottom: 24px;">Please use the verification code below to complete your registration. This code is valid for 10 minutes.</p>
          <div style="background-color: #ffffff; border: 2px dashed #cbd5e0; border-radius: 4px; padding: 16px; margin-bottom: 24px;">
            <span style="font-family: monospace; font-size: 32px; font-weight: bold; letter-spacing: 4px; color: #2d3748;">${otp}</span>
          </div>
          <p style="color: #a0aec0; font-size: 12px; margin: 0;">If you did not request this code, please ignore this email.</p>
        </div>
        <div style="text-align: center; margin-top: 24px; border-top: 1px solid #eaeaec; padding-top: 16px;">
          <p style="color: #a0aec0; font-size: 12px; margin: 0;">&copy; ${new Date().getFullYear()} Guntur Municipal Corporation. All rights reserved.</p>
        </div>
      </div>
    `;

    await transporter.sendMail({
      from: `"Guntur Civic Portal" <${process.env.MAIL_USER}>`,
      to: email,
      subject: 'Your Verification Code - Guntur Civic Portal',
      html: emailHtml,
    });
    console.log(`📧 OTP email sent successfully to ${email}`);
    return true;
  } catch (err) {
    console.error(`❌ OTP email failed to send to ${email}. Error:`, err.message);
    return false;
  }
};

// ── CITIZEN REGISTER ─────────────────────────────────────────────────────────
router.post('/register', [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('phone').matches(/^[6-9][0-9]{9}$/).withMessage('Phone must be a valid 10-digit Indian number'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array()[0].msg, errors: errors.array() });
  }

  try {
    const { name, email, phone, password, ward, pincode } = req.body;
    if (await User.findOne({ email })) return res.status(400).json({ message: 'Email already registered' });

    const user = new User({ name, email, phone, password, ward, pincode: pincode || '522001' });
    const otp = user.generateOtp();
    await user.save();
    const emailSent = await sendOtpEmail(email, otp, name);

    const response = { message: 'OTP sent to email', userId: user._id };
    // If email not configured, include OTP in response so user can still verify
    if (!emailSent) {
      response.otp = otp;
      response.message = 'Email not configured — use the OTP shown below';
    }
    res.json(response);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── VERIFY OTP ────────────────────────────────────────────────────────────────
router.post('/verify-otp', async (req, res) => {
  try {
    const { userId, otp } = req.body;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (!user.otp || user.otpExpiry < Date.now()) return res.status(400).json({ message: 'OTP expired' });
    if (user.otp !== otp) return res.status(400).json({ message: 'Invalid OTP' });

    user.emailVerified = true;
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();

    const token = makeToken({ id: user._id, role: 'citizen', name: user.name });
    res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: 'citizen' } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── RESEND OTP ────────────────────────────────────────────────────────────────
router.post('/resend-otp', async (req, res) => {
  try {
    const { userId } = req.body;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    const otp = user.generateOtp();
    await user.save();
    await sendOtpEmail(user.email, otp, user.name);
    res.json({ message: 'OTP resent' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── CITIZEN LOGIN ─────────────────────────────────────────────────────────────
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password))) return res.status(400).json({ message: 'Invalid credentials' });
    if (!user.emailVerified) {
      const otp = user.generateOtp();
      await user.save();
      const emailSent = await sendOtpEmail(user.email, otp, user.name);
      const response = { message: 'Email not verified. OTP resent.', userId: user._id, requiresVerification: true };
      if (!emailSent) response.otp = otp;
      return res.status(403).json(response);
    }
    const token = makeToken({ id: user._id, role: 'citizen', name: user.name });
    res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: 'citizen' } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── ADMIN LOGIN ───────────────────────────────────────────────────────────────
router.post('/admin/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const admin = await Admin.findOne({ email });
    if (!admin || !(await admin.matchPassword(password))) return res.status(400).json({ message: 'Invalid credentials' });
    const token = makeToken({ id: admin._id, role: 'admin', name: admin.name });
    res.json({ token, user: { id: admin._id, name: admin.name, email: admin.email, role: 'admin' } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── OFFICER LOGIN ─────────────────────────────────────────────────────────────
router.post('/officer/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const officer = await Officer.findOne({ email }).populate('department', 'name shortName');
    if (!officer || !(await officer.matchPassword(password))) return res.status(400).json({ message: 'Invalid credentials' });
    if (!officer.isActive) return res.status(403).json({ message: 'Account deactivated. Contact admin.' });
    const token = makeToken({ id: officer._id, role: 'officer', name: officer.name, department: officer.department._id });
    res.json({ token, user: { id: officer._id, name: officer.name, email: officer.email, role: 'officer', department: officer.department } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
