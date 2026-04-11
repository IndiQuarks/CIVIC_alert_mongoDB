const router = require('express').Router();
const Department = require('../models/Department');
const Officer = require('../models/Officer');

router.get('/', async (req, res) => {
  try {
    const departments = await Department.find().sort({ name: 1 });
    res.json(departments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/:id/officers', async (req, res) => {
  try {
    const officers = await Officer.find({ department: req.params.id, isActive: true }).select('-password');
    res.json(officers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
