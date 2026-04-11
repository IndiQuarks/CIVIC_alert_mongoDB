const router = require('express').Router();
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');
const Complaint = require('../models/Complaint');
const Officer = require('../models/Officer');
const Department = require('../models/Department');

// ── DASHBOARD STATS ───────────────────────────────────────────────────────────
router.get('/stats', auth(['admin']), async (req, res) => {
  try {
    const [total, pending, assigned, inProgress, resolved, rejected] = await Promise.all([
      Complaint.countDocuments(),
      Complaint.countDocuments({ status: 'pending' }),
      Complaint.countDocuments({ status: 'assigned' }),
      Complaint.countDocuments({ status: 'in_progress' }),
      Complaint.countDocuments({ status: 'resolved' }),
      Complaint.countDocuments({ status: 'rejected' }),
    ]);
    const byCategory = await Complaint.aggregate([{ $group: { _id: '$category', count: { $sum: 1 } } }]);
    const byDept = await Complaint.aggregate([
      { $match: { assignedDept: { $ne: null } } },
      { $group: { _id: '$assignedDept', count: { $sum: 1 } } },
      { $lookup: { from: 'departments', localField: '_id', foreignField: '_id', as: 'dept' } },
      { $unwind: '$dept' },
      { $project: { name: '$dept.shortName', count: 1 } },
    ]);
    res.json({ total, pending, assigned, inProgress, resolved, rejected, byCategory, byDept });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── LIST ALL COMPLAINTS ───────────────────────────────────────────────────────
router.get('/complaints', auth(['admin']), async (req, res) => {
  try {
    const { status, category, dept, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (category) filter.category = category;
    if (dept) filter.assignedDept = dept;

    const complaints = await Complaint.find(filter)
      .populate('citizen', 'name email phone')
      .populate('assignedDept', 'name shortName colorHex')
      .populate('assignedOfficer', 'name designation')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    const total = await Complaint.countDocuments(filter);
    res.json({ complaints, total, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── GET SINGLE COMPLAINT ──────────────────────────────────────────────────────
router.get('/complaints/:id', auth(['admin']), async (req, res) => {
  try {
    const c = await Complaint.findById(req.params.id)
      .populate('citizen', 'name email phone ward pincode')
      .populate('assignedDept', 'name shortName colorHex contactEmail headName')
      .populate('assignedOfficer', 'name email designation phone');
    if (!c) return res.status(404).json({ message: 'Not found' });
    res.json(c);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── ASSIGN COMPLAINT ──────────────────────────────────────────────────────────
router.put('/complaints/:id/assign', auth(['admin']), async (req, res) => {
  try {
    const { deptId, officerId, adminRemarks } = req.body;
    const c = await Complaint.findById(req.params.id);
    if (!c) return res.status(404).json({ message: 'Not found' });

    c.assignedDept = deptId;
    c.assignedOfficer = officerId;
    c.status = 'assigned';
    if (adminRemarks) c.adminRemarks = adminRemarks;
    c.statusHistory.push({ status: 'assigned', note: adminRemarks || 'Assigned to department', changedBy: 'Admin' });
    await c.save();

    const populated = await Complaint.findById(c._id)
      .populate('assignedDept', 'name shortName colorHex')
      .populate('assignedOfficer', 'name designation');
    res.json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── UPDATE STATUS / REMARKS ───────────────────────────────────────────────────
router.put('/complaints/:id/status', auth(['admin']), async (req, res) => {
  try {
    const { status, adminRemarks } = req.body;
    const c = await Complaint.findById(req.params.id);
    if (!c) return res.status(404).json({ message: 'Not found' });
    c.status = status;
    if (adminRemarks) c.adminRemarks = adminRemarks;
    if (status === 'resolved') c.resolvedAt = new Date();
    c.statusHistory.push({ status, note: adminRemarks || '', changedBy: 'Admin' });
    await c.save();
    res.json(c);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── OFFICERS MANAGEMENT ───────────────────────────────────────────────────────
router.get('/officers', auth(['admin']), async (req, res) => {
  try {
    const officers = await Officer.find().populate('department', 'name shortName').sort({ createdAt: -1 });
    res.json(officers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/officers', auth(['admin']), async (req, res) => {
  try {
    const { name, email, phone, password, designation, department } = req.body;
    if (await Officer.findOne({ email })) return res.status(400).json({ message: 'Email already in use' });
    const officer = new Officer({ name, email, phone, password, designation, department });
    await officer.save();
    const populated = await Officer.findById(officer._id).populate('department', 'name shortName');
    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/officers/:id', auth(['admin']), async (req, res) => {
  try {
    const { isActive, designation, phone } = req.body;
    const officer = await Officer.findByIdAndUpdate(req.params.id, { isActive, designation, phone }, { new: true })
      .populate('department', 'name shortName');
    res.json(officer);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/officers/:id', auth(['admin']), async (req, res) => {
  try {
    await Officer.findByIdAndDelete(req.params.id);
    res.json({ message: 'Officer removed' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
