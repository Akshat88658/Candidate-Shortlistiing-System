const express = require('express');
const router = express.Router();
const Complaint = require('../models/Complaint');
const { analyzeComplaintText } = require('./ai');

// Validation helper for email
const isValidEmail = (email) => {
  const re = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
  return re.test(String(email).toLowerCase());
};

// a). Add Complaint: POST /api/complaints
router.post('/', async (req, res) => {
  try {
    const { name, email, title, description, category, location } = req.body;

    // 1. Validation Checks as per Q3 Test Cases
    if (!title || title.trim() === '') {
      return res.status(400).json({ 
        success: false, 
        message: 'Validation error: Missing title field' 
      });
    }
    if (!name || name.trim() === '') {
      return res.status(400).json({ success: false, message: 'Validation error: Missing name field' });
    }
    if (!email || email.trim() === '') {
      return res.status(400).json({ success: false, message: 'Validation error: Missing email field' });
    }
    if (!isValidEmail(email)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Error message: Invalid email' 
      });
    }
    if (!description || description.trim() === '') {
      return res.status(400).json({ success: false, message: 'Validation error: Missing description field' });
    }
    if (!category || category.trim() === '') {
      return res.status(400).json({ success: false, message: 'Validation error: Missing category field' });
    }
    if (!location || location.trim() === '') {
      return res.status(400).json({ success: false, message: 'Validation error: Missing location field' });
    }

    // 2. Perform AI Complaint Analysis (Urgency, Department, Summary, Response)
    console.log('🤖 Triggering automated AI analysis for complaint:', title);
    const aiAnalysis = await analyzeComplaintText({
      name,
      email,
      title,
      description,
      category,
      location
    });

    // 3. Create and Save Complaint with AI attributes
    const complaint = new Complaint({
      name,
      email,
      title,
      description,
      category,
      location,
      status: 'Pending',
      aiPriority: aiAnalysis.priority,
      aiDepartment: aiAnalysis.department,
      aiSummary: aiAnalysis.summary,
      aiAutoResponse: aiAnalysis.autoResponse
    });

    const savedComplaint = await complaint.save();
    console.log('✅ Complaint saved successfully inside MongoDB:', savedComplaint._id);

    res.status(201).json({
      success: true,
      message: 'Complaint stored successfully',
      complaint: savedComplaint
    });
  } catch (err) {
    console.error('Error adding complaint:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// d). Search Complaint by Location: GET /api/complaints/search
// Note: Put this route BEFORE the GET /api/complaints/:id route to prevent route conflicts!
router.get('/search', async (req, res) => {
  try {
    const { location } = req.query;
    
    if (!location || location.trim() === '') {
      return res.status(400).json({ 
        success: false, 
        message: 'Location query parameter is required' 
      });
    }

    console.log(`🔍 Searching complaints matching location: "${location}"`);
    // Case-insensitive regex match
    const complaints = await Complaint.find({ 
      location: { $regex: location, $options: 'i' } 
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      count: complaints.length,
      complaints
    });
  } catch (err) {
    console.error('Error searching complaints:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// b). Get All Complaints: GET /api/complaints
// Supports optional filtering by category e.g. GET /api/complaints?category=Water Supply
router.get('/', async (req, res) => {
  try {
    const { category } = req.query;
    let query = {};
    
    if (category && category.trim() !== '') {
      query.category = category;
    }

    const complaints = await Complaint.find(query).sort({ createdAt: -1 });
    res.json({
      success: true,
      count: complaints.length,
      complaints
    });
  } catch (err) {
    console.error('Error fetching complaints:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/complaints/:id - Fetch single complaint by ID
router.get('/:id', async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }
    res.json({ success: true, complaint });
  } catch (err) {
    console.error('Error fetching single complaint:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// 3. Update Complaint Status: PUT /api/complaints/:id
router.put('/:id', async (req, res) => {
  try {
    const { status } = req.body;

    if (!status || !['Pending', 'In Progress', 'Resolved'].includes(status)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Valid status is required ("Pending", "In Progress", "Resolved")' 
      });
    }

    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    complaint.status = status;
    const updatedComplaint = await complaint.save();
    console.log(`✏️ Status updated to "${status}" for complaint:`, updatedComplaint._id);

    res.json({
      success: true,
      message: 'Complaint status updated successfully',
      complaint: updatedComplaint
    });
  } catch (err) {
    console.error('Error updating complaint status:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/complaints/:id - Delete a complaint
router.delete('/:id', async (req, res) => {
  try {
    const complaint = await Complaint.findByIdAndDelete(req.params.id);
    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }
    console.log('🗑️ Complaint removed:', complaint._id);
    res.json({
      success: true,
      message: 'Complaint removed successfully'
    });
  } catch (err) {
    console.error('Error deleting complaint:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
