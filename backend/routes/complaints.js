const router = require('express').Router();
const path = require('path');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');
const Complaint = require('../models/Complaint');

// Extract GPS from image using exifr
const extractGps = async (filePath) => {
  try {
    const exifr = require('exifr');
    const gps = await exifr.gps(filePath);
    return gps || null;
  } catch {
    return null;
  }
};

// ── SUBMIT COMPLAINT ──────────────────────────────────────────────────────────
router.post('/', auth(['citizen']), upload.array('images', 3), async (req, res) => {
  try {
    const { title, description, category, address, ward, pincode } = req.body;
    let latitude = req.body.latitude ? parseFloat(req.body.latitude) : null;
    let longitude = req.body.longitude ? parseFloat(req.body.longitude) : null;

    const images = [];
    for (const file of (req.files || [])) {
      images.push({ filename: file.filename, originalName: file.originalname });
      // Try to extract GPS from first image if not provided
      if (!latitude && !longitude) {
        const gps = await extractGps(file.path);
        if (gps) { latitude = gps.latitude; longitude = gps.longitude; }
      }
    }

    const complaint = new Complaint({
      title, description, category, address, ward, pincode,
      latitude, longitude, images,
      citizen: req.user.id,
      statusHistory: [{ status: 'pending', note: 'Complaint submitted', changedBy: req.user.name }],
    });
    await complaint.save();
    res.status(201).json(complaint);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── GET CITIZEN'S COMPLAINTS ──────────────────────────────────────────────────
router.get('/', auth(['citizen']), async (req, res) => {
  try {
    const complaints = await Complaint.find({ citizen: req.user.id })
      .populate('assignedDept', 'name shortName colorHex')
      .populate('assignedOfficer', 'name designation')
      .sort({ createdAt: -1 });
    res.json(complaints);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── GET SINGLE COMPLAINT (citizen) ────────────────────────────────────────────
router.get('/:id', auth(['citizen']), async (req, res) => {
  try {
    const complaint = await Complaint.findOne({ _id: req.params.id, citizen: req.user.id })
      .populate('assignedDept', 'name shortName colorHex contactEmail headName')
      .populate('assignedOfficer', 'name designation phone');
    if (!complaint) return res.status(404).json({ message: 'Not found' });
    res.json(complaint);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
