const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name:          { type: String, required: true, trim: true },
  email:         { type: String, required: true, unique: true, lowercase: true },
  phone:         { type: String, required: true },
  password:      { type: String, required: true },
  ward:          { type: String, default: '' },
  pincode:       { type: String, default: '522001' },
  city:          { type: String, default: 'Guntur' },
  state:         { type: String, default: 'Andhra Pradesh' },
  role:          { type: String, default: 'citizen' },
  emailVerified: { type: Boolean, default: false },
  otp:           { type: String },
  otpExpiry:     { type: Date },
}, { timestamps: true });

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.matchPassword = function (plain) {
  return bcrypt.compare(plain, this.password);
};

userSchema.methods.generateOtp = function () {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  this.otp = otp;
  this.otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
  return otp;
};

module.exports = mongoose.model('User', userSchema);
