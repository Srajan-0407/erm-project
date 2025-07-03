const express = require('express');
const Project = require('../models/Project');
const Assignment = require('../models/Assignment');
const { auth, manager } = require('../middleware/auth');

const router = express.Router();

router.get('/', auth, async (req, res) => {
  try {
    const { status, skill } = req.query;
    let query = {};
    
    if (status) query.status = status;
    if (skill) query.requiredSkills = { $in: [skill] };

    const projects = await Project.find(query).populate('manager', 'name email');
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/', auth, manager, async (req, res) => {
  try {
    const project = new Project({
      ...req.body,
      manager: req.user._id,
    });
    await project.save();
    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('manager', 'name email');
    
    const assignments = await Assignment.find({ project: req.params.id })
      .populate('engineer', 'name email skills seniority');
    
    res.json({ ...project.toObject(), assignments });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/:id', auth, manager, async (req, res) => {
  try {
    const project = await Project.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;