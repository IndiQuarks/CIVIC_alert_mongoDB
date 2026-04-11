const mongoose = require('mongoose');

const statusHistorySchema = new mongoose.Schema({
  status:    String,
  note:      String,
  changedBy: String,
  changedAt: { type: Date, default: Date.now },
});

const complaintSchema = new mongoose.Schema({
  trackingId:    { type: String, unique: true },
  title:         { type: String, required: true },
  description:   { type: String, required: true },
  category:      { type: String, required: true },

  // Location
  address:       { type: String, required: true },
  ward:          { type: String },
  pincode:       { type: String },
  latitude:      { type: Number },
  longitude:     { type: Number },

  // Status workflow
  status: {
    type: String,
    enum: ['pending', 'assigned', 'in_progress', 'resolved', 'rejected', 'disputed'],
    default: 'pending',
  },

  // Images
  images:         [{ filename: String, originalName: String }],
  resolvedImages: [{ filename: String, originalName: String }],

  // Relationships
  citizen:          { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  assignedDept:     { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
  assignedOfficer:  { type: mongoose.Schema.Types.ObjectId, ref: 'Officer' },

  // Remarks
  adminRemarks:     { type: String },
  officerRemarks:   { type: String },

  statusHistory:    [statusHistorySchema],
  resolvedAt:       { type: Date },
}, { timestamps: true });

// Generate tracking ID before save
complaintSchema.pre('save', async function (next) {
  if (!this.trackingId) {
    const count = await mongoose.model('Complaint').countDocuments();
    this.trackingId = `GNT-${String(count + 1).padStart(5, '0')}`;
  }
  next();
});

module.exports = mongoose.model('Complaint', complaintSchema);
