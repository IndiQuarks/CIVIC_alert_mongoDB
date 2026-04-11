const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const officerSchema = new mongoose.Schema({
  name:        { type: String, required: true },
  email:       { type: String, required: true, unique: true, lowercase: true },
  phone:       { type: String },
  password:    { type: String, required: true },
  designation: { type: String },
  department:  { type: mongoose.Schema.Types.ObjectId, ref: 'Department', required: true },
  role:        { type: String, default: 'officer' },
  isActive:    { type: Boolean, default: true },
}, { timestamps: true });

officerSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

officerSchema.methods.matchPassword = function (plain) {
  return bcrypt.compare(plain, this.password);
};

module.exports = mongoose.model('Officer', officerSchema);
