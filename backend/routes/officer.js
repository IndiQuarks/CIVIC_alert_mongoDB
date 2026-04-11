const router = require('express').Router();
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');
const Complaint = require('../models/Complaint');

// ── OFFICER'S ASSIGNED COMPLAINTS ─────────────────────────────────────────────
router.get('/complaints', auth(['officer']), async (req, res) => {
  try {
    const { status } = req.query;
    const filter = { assignedOfficer: req.user.id };
    if (status) filter.status = status;
    const complaints = await Complaint.find(filter)
      .populate('citizen', 'name phone ward')
      .populate('assignedDept', 'name shortName colorHex')
      .sort({ createdAt: -1 });
    res.json(complaints);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── GET SINGLE COMPLAINT ──────────────────────────────────────────────────────
router.get('/complaints/:id', auth(['officer']), async (req, res) => {
  try {
    const c = await Complaint.findOne({ _id: req.params.id, assignedOfficer: req.user.id })
      .populate('citizen', 'name email phone ward pincode')
      .populate('assignedDept', 'name shortName colorHex');
    if (!c) return res.status(404).json({ message: 'Not found or not assigned to you' });
    res.json(c);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── UPDATE STATUS (officer starts work) ──────────────────────────────────────
router.put('/complaints/:id/start', auth(['officer']), async (req, res) => {
  try {
    const c = await Complaint.findOne({ _id: req.params.id, assignedOfficer: req.user.id });
    if (!c) return res.status(404).json({ message: 'Not found' });
    c.status = 'in_progress';
    c.statusHistory.push({ status: 'in_progress', note: 'Officer has started working on the issue', changedBy: req.user.name });
    await c.save();
    res.json(c);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── RESOLVE COMPLAINT (with proof images) ─────────────────────────────────────
router.put('/complaints/:id/resolve', auth(['officer']), upload.array('resolvedImages', 3), async (req, res) => {
  try {
    const c = await Complaint.findOne({ _id: req.params.id, assignedOfficer: req.user.id });
    if (!c) return res.status(404).json({ message: 'Not found' });

    const resolvedImages = (req.files || []).map(f => ({ filename: f.filename, originalName: f.originalname }));
    c.resolvedImages = resolvedImages;
    c.officerRemarks = req.body.officerRemarks || '';
    c.status = 'resolved';
    c.resolvedAt = new Date();
    c.statusHistory.push({ status: 'resolved', note: req.body.officerRemarks || 'Issue resolved', changedBy: req.user.name });
    await c.save();
    res.json(c);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── OFFICER STATS ─────────────────────────────────────────────────────────────
router.get('/stats', auth(['officer']), async (req, res) => {
  try {
    const [total, assigned, inProgress, resolved] = await Promise.all([
      Complaint.countDocuments({ assignedOfficer: req.user.id }),
      Complaint.countDocuments({ assignedOfficer: req.user.id, status: 'assigned' }),
      Complaint.countDocuments({ assignedOfficer: req.user.id, status: 'in_progress' }),
      Complaint.countDocuments({ assignedOfficer: req.user.id, status: 'resolved' }),
    ]);
    res.json({ total, assigned, inProgress, resolved });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
