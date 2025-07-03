const express = require('express');
const Assignment = require('../models/Assignment');
const Engineer = require('../models/Engineer');
const { auth, manager } = require('../middleware/auth');

const router = express.Router();

router.get('/', auth, async (req, res) => {
  try {
    const assignments = await Assignment.find()
      .populate('engineer', 'name email skills')
      .populate('project', 'name startDate endDate')
      .populate('assignedBy', 'name');
    res.json(assignments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/', auth, manager, async (req, res) => {
  try {
    const { engineer, project, allocationPercentage, startDate, endDate, role } = req.body;
    
    // Check engineer availability
    const eng = await Engineer.findById(engineer);
    const activeAssignments = await Assignment.find({
      engineer,
      status: 'active',
      startDate: { $lte: new Date(endDate) },
      endDate: { $gte: new Date(startDate) },
    });
    
    const totalAllocated = activeAssignments.reduce((sum, a) => sum + a.allocationPercentage, 0);
    
    if (totalAllocated + allocationPercentage > eng.maxCapacity) {
      return res.status(400).json({ 
        message: 'Engineer does not have sufficient capacity',
        available: eng.maxCapacity - totalAllocated 
      });
    }

    const assignment = new Assignment({
      engineer,
      project,
      allocationPercentage,
      startDate,
      endDate,
      role,
      assignedBy: req.user._id,
      status: 'active',
    });

    await assignment.save();
    await assignment.populate('engineer project assignedBy');
    res.status(201).json(assignment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;