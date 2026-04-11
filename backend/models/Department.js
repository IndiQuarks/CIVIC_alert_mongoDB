const mongoose = require('mongoose');

const departmentSchema = new mongoose.Schema({
  name:        { type: String, required: true },
  shortName:   { type: String, required: true },
  description: { type: String },
  categories:  [{ type: String }],
  contactEmail:{ type: String },
  headName:    { type: String },
  colorHex:    { type: String, default: '#A78966' },
}, { timestamps: true });

module.exports = mongoose.model('Department', departmentSchema);
