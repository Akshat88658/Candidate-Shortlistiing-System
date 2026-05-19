const express = require('express');
const router = express.Router();
const Employee = require('../models/Employee');
const authMiddleware = require('../middleware/auth');

// Apply auth middleware to all employee routes
router.use(authMiddleware);

// a. Add Employee: POST /api/employees
router.post('/', async (req, res) => {
  try {
    const { name, email, department, skills, performanceScore, experience } = req.body;

    // Build the employee document
    const employee = new Employee({
      name,
      email,
      department,
      skills: Array.isArray(skills) ? skills.map(s => s.trim()) : [],
      performanceScore,
      experience
    });

    const saved = await employee.save();
    res.status(201).json({ success: true, data: saved });
  } catch (err) {
    // Check for duplicate key error (code 11000 in MongoDB is for duplicates)
    if (err.code === 11000) {
      return res.status(400).json({ success: false, message: 'Email already exists' });
    }
    // Validation errors
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ success: false, message: messages.join(', ') });
    }
    res.status(500).json({ success: false, message: err.message });
  }
});

// c. Search Employee: GET /api/employees/search
// Handles GET /api/employees/search?department=Development
router.get('/search', async (req, res) => {
  try {
    const { department, skill, minScore, maxScore } = req.query;
    let query = {};

    if (department) {
      query.department = new RegExp(department.trim(), 'i');
    }

    if (skill) {
      query.skills = new RegExp(skill.trim(), 'i');
    }

    if (minScore || maxScore) {
      query.performanceScore = {};
      if (minScore) query.performanceScore.$gte = Number(minScore);
      if (maxScore) query.performanceScore.$lte = Number(maxScore);
    }

    const employees = await Employee.find(query).sort({ performanceScore: -1 });
    res.json({ success: true, count: employees.length, data: employees });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// b. Get All Employees: GET /api/employees
router.get('/', async (req, res) => {
  try {
    const { search } = req.query;
    let query = {};

    if (search) {
      const regex = new RegExp(search.trim(), 'i');
      query = {
        $or: [
          { name: regex },
          { email: regex },
          { department: regex },
          { skills: { $in: [regex] } }
        ]
      };
    }

    const employees = await Employee.find(query).sort({ createdAt: -1 });
    res.json({ success: true, count: employees.length, data: employees });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/employees/:id - Get single employee
router.get('/:id', async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }
    res.json({ success: true, data: employee });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Update Employee: PUT /api/employees/:id
// E.g., for updating performance score, years of experience, or details
router.put('/:id', async (req, res) => {
  try {
    const { name, email, department, skills, performanceScore, experience } = req.body;
    
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (department !== undefined) updateData.department = department;
    if (skills !== undefined) updateData.skills = Array.isArray(skills) ? skills.map(s => s.trim()) : [];
    if (performanceScore !== undefined) updateData.performanceScore = performanceScore;
    if (experience !== undefined) updateData.experience = experience;

    const updated = await Employee.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    res.json({ success: true, data: updated });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ success: false, message: 'Email already exists' });
    }
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ success: false, message: messages.join(', ') });
    }
    res.status(500).json({ success: false, message: err.message });
  }
});

// Delete Employee: DELETE /api/employees/:id
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Employee.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }
    res.json({ success: true, message: 'Employee removed successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
