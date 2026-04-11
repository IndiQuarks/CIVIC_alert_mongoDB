const router = require('express').Router();
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Admin = require('../models/Admin');
const Officer = require('../models/Officer');
const nodemailer = require('nodemailer');

const makeToken = (payload) => jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });

// Send OTP email
const sendOtpEmail = async (email, otp, name) => {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: process.env.MAIL_USER, pass: process.env.MAIL_PASS },
    });
    await transporter.sendMail({
      from: `"Guntur Civic Portal" <${process.env.MAIL_USER}>`,
      to: email,
      subject: 'Your OTP for Guntur Civic Portal',
      html: `<p>Hi ${name},</p><p>Your OTP is: <strong style="font-size:24px">${otp}</strong></p><p>Valid for 10 minutes.</p>`,
    });
  } catch {
    console.log(`📧 OTP for ${email}: ${otp} (email not configured)`);
  }
};

// ── CITIZEN REGISTER ─────────────────────────────────────────────────────────
router.post('/register', [
  body('name').notEmpty(),
  body('email').isEmail(),
  body('phone').matches(/^[6-9][0-9]{9}$/),
  body('password').isLength({ min: 6 }),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const { name, email, phone, password, ward, pincode } = req.body;
    if (await User.findOne({ email })) return res.status(400).json({ message: 'Email already registered' });

    const user = new User({ name, email, phone, password, ward, pincode: pincode || '522001' });
    const otp = user.generateOtp();
    await user.save();
    await sendOtpEmail(email, otp, name);

    res.json({ message: 'OTP sent to email', userId: user._id });
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
      await sendOtpEmail(user.email, otp, user.name);
      return res.status(403).json({ message: 'Email not verified. OTP resent.', userId: user._id, requiresVerification: true });
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
