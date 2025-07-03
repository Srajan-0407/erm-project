const express = require('express');
const router = express.Router();
const DataValidator = require('../utils/checkAndFix');
const auth = require('../middleware/auth');

router.get('/check', auth, async (req, res) => {
  try {
    const validator = new DataValidator();
    const results = await validator.runAllChecks();
    
    res.json({
      success: true,
      data: results,
      timestamp: new Date()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

router.post('/fix', auth, async (req, res) => {
  try {
    const validator = new DataValidator();
    const results = await validator.runAllFixes();
    
    res.json({
      success: true,
      data: results,
      timestamp: new Date()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

router.post('/check-and-fix', auth, async (req, res) => {
  try {
    const validator = new DataValidator();
    const checkResults = await validator.runAllChecks();
    const fixResults = await validator.runAllFixes();
    
    res.json({
      success: true,
      data: {
        checks: checkResults,
        fixes: fixResults
      },
      timestamp: new Date()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;