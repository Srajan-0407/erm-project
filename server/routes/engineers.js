const express = require('express');
const Engineer = require('../models/Engineer');
const Assignment = require('../models/Assignment');
const User = require('../models/User');
const { auth, manager } = require('../middleware/auth');

const router = express.Router();

// Get all engineers
router.get('/', auth, async (req, res) => {
  try {
    const { skill, seniority, department, available } = req.query;
    let query = {};

    if (skill) {
      query.skills = { $in: [skill] };
    }
    if (seniority) {
      query.seniority = seniority;
    }
    if (department) {
      query.department = department;
    }

    const engineers = await Engineer.find(query).populate('user', 'name email');
    
    // Calculate availability if requested
    if (available === 'true') {
      const engineersWithAvailability = await Promise.all(
        engineers.map(async (engineer) => {
          const activeAssignments = await Assignment.find({
            engineer: engineer._id,
            status: 'active',
          });
          
          const totalAllocated = activeAssignments.reduce(
            (sum, assignment) => sum + assignment.allocationPercentage,
            0
          );
          
          const availableCapacity = engineer.maxCapacity - totalAllocated;
          
          return {
            ...engineer.toObject(),
            availableCapacity,
            isAvailable: availableCapacity > 0,
          };
        })
      );
      console.log(engineersWithAvailability);
      
      return res.json(engineersWithAvailability.filter(eng => eng.isAvailable));
    }

    res.json(engineers);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

// Get engineer by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const engineer = await Engineer.findById(req.params.id)
      .populate('user', 'name email');
    
    if (!engineer) {
      return res.status(404).json({ message: 'Engineer not found' });
    }

    // Get active assignments
    const assignments = await Assignment.find({
      engineer: engineer._id,
      status: { $in: ['pending', 'active'] },
    }).populate('project', 'name startDate endDate');

    const totalAllocated = assignments
      .filter(a => a.status === 'active')
      .reduce((sum, assignment) => sum + assignment.allocationPercentage, 0);

    const availableCapacity = engineer.maxCapacity - totalAllocated;

    res.json({
      ...engineer.toObject(),
      assignments,
      availableCapacity,
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

// Create engineer (managers only)
router.post('/', auth, manager, async (req, res) => {
  try {
    const { name, email, password, skills, seniority, department, maxCapacity } = req.body;

    // Validate required fields
    if (!name || !email || !password || !skills || !seniority || !department) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    // Create user first
    const user = new User({
      name,
      email,
      password,
      role: 'engineer',
      department,
    });

    await user.save();

    // Create engineer profile
    const engineer = new Engineer({
      user: user._id,
      name,
      email,
      skills,
      seniority,
      department,
      maxCapacity: maxCapacity || 100,
    });

    await engineer.save();
    
    // Populate user info before sending response
    await engineer.populate('user', 'name email');
    res.status(201).json(engineer);
  } catch (error) {
    console.error(error.message);
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Engineer with this email already exists' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// Update engineer
router.put('/:id', auth, async (req, res) => {
  try {
    const { name, skills, seniority, department, maxCapacity } = req.body;
    
    // Engineers can only update their own profile, managers can update any
    if (req.user.role === 'engineer') {
      const engineer = await Engineer.findOne({ user: req.user._id });
      if (!engineer || engineer._id.toString() !== req.params.id) {
        return res.status(403).json({ message: 'Access denied' });
      }
    }

    const engineer = await Engineer.findByIdAndUpdate(
      req.params.id,
      { name, skills, seniority, department, maxCapacity },
      { new: true }
    );

    if (!engineer) {
      return res.status(404).json({ message: 'Engineer not found' });
    }

    res.json(engineer);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

// Delete engineer (managers only)
router.delete('/:id', auth, manager, async (req, res) => {
  try {
    const engineer = await Engineer.findById(req.params.id);
    
    if (!engineer) {
      return res.status(404).json({ message: 'Engineer not found' });
    }

    // Check for active assignments
    const activeAssignments = await Assignment.find({
      engineer: engineer._id,
      status: 'active',
    });

    if (activeAssignments.length > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete engineer with active assignments' 
      });
    }

    await Engineer.findByIdAndDelete(req.params.id);
    res.json({ message: 'Engineer deleted successfully' });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

// Get engineer's assignments
router.get('/:id/assignments', auth, async (req, res) => {
  try {
    const assignments = await Assignment.find({
      engineer: req.params.id,
    })
      .populate('project', 'name description startDate endDate status')
      .populate('assignedBy', 'name')
      .sort({ startDate: -1 });

    res.json(assignments);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;