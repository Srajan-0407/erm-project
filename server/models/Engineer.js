const mongoose = require('mongoose');

const engineerSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  skills: [{
    type: String,
    required: true,
  }],
  seniority: {
    type: String,
    enum: ['junior', 'mid', 'senior', 'lead', 'principal'],
    required: true,
  },
  department: {
    type: String,
    required: true,
  },
  maxCapacity: {
    type: Number,
    default: 100, // 100% = full-time, 50% = part-time
    min: 0,
    max: 100,
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active',
  },
}, {
  timestamps: true,
});

engineerSchema.virtual('assignments', {
  ref: 'Assignment',
  localField: '_id',
  foreignField: 'engineer',
});

module.exports = mongoose.model('Engineer', engineerSchema);