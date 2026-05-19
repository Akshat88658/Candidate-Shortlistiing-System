const mongoose = require('mongoose');

const EmployeeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Employee Name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']
  },
  department: {
    type: String,
    required: [true, 'Department is required'],
    trim: true
  },
  skills: {
    type: [String],
    required: [true, 'Skills are required'],
    validate: {
      validator: function(v) {
        return Array.isArray(v) && v.length > 0;
      },
      message: 'At least one skill is required'
    }
  },
  performanceScore: {
    type: Number,
    required: [true, 'Performance Score is required'],
    min: [0, 'Performance Score cannot be less than 0'],
    max: [100, 'Performance Score cannot exceed 100']
  },
  experience: {
    type: Number,
    required: [true, 'Years of Experience is required'],
    min: [0, 'Years of Experience cannot be negative']
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Employee', EmployeeSchema);
