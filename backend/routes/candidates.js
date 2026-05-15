const express = require('express');
const router = express.Router();
const Candidate = require('../models/Candidate');

// POST /api/candidates - Add a new candidate
router.post('/', async (req, res) => {
  try {
    const { name, email, skills, experience, bio } = req.body;

    // Normalize skills: trim and capitalize
    const normalizedSkills = skills.map(s => s.trim());

    const candidate = new Candidate({
      name,
      email,
      skills: normalizedSkills,
      experience,
      bio: bio || ''
    });

    const saved = await candidate.save();
    res.status(201).json({ success: true, data: saved });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ success: false, message: 'Email already exists' });
    }
    res.status(400).json({ success: false, message: err.message });
  }
});

// GET /api/candidates - Get all candidates (with optional search)
router.get('/', async (req, res) => {
  try {
    const { search } = req.query;
    let filter = {};

    if (search) {
      const regex = new RegExp(search, 'i');
      filter = {
        $or: [
          { name: regex },
          { email: regex },
          { skills: { $in: [regex] } }
        ]
      };
    }

    const candidates = await Candidate.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, data: candidates });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/candidates/:id - Get single candidate
router.get('/:id', async (req, res) => {
  try {
    const candidate = await Candidate.findById(req.params.id);
    if (!candidate) {
      return res.status(404).json({ success: false, message: 'Candidate not found' });
    }
    res.json({ success: true, data: candidate });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/candidates/:id - Remove a candidate
router.delete('/:id', async (req, res) => {
  try {
    const candidate = await Candidate.findByIdAndDelete(req.params.id);
    if (!candidate) {
      return res.status(404).json({ success: false, message: 'Candidate not found' });
    }
    res.json({ success: true, message: 'Candidate deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
