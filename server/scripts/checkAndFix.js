#!/usr/bin/env node

require('dotenv').config();
const mongoose = require('mongoose');
const DataValidator = require('../utils/checkAndFix');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/engineering-management';

async function connectDB() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
}

async function main() {
  await connectDB();
  
  const validator = new DataValidator();
  const command = process.argv[2];
  
  switch (command) {
    case 'check':
      console.log('Running data validation checks...\n');
      const checkResults = await validator.runAllChecks();
      
      if (checkResults.errors.length > 0) {
        console.log('🚨 ERRORS FOUND:');
        checkResults.errors.forEach((error, index) => {
          console.log(`${index + 1}. [${error.type}] ${error.message}`);
        });
        console.log('');
      }
      
      if (checkResults.warnings.length > 0) {
        console.log('⚠️  WARNINGS:');
        checkResults.warnings.forEach((warning, index) => {
          console.log(`${index + 1}. [${warning.type}] ${warning.message}`);
        });
        console.log('');
      }
      
      console.log(`Summary: ${checkResults.summary.totalErrors} errors, ${checkResults.summary.totalWarnings} warnings`);
      break;
      
    case 'fix':
      console.log('Running automated fixes...\n');
      const fixResults = await validator.runAllFixes();
      
      if (fixResults.fixes.length > 0) {
        console.log('🔧 FIXES APPLIED:');
        fixResults.fixes.forEach((fix, index) => {
          console.log(`${index + 1}. [${fix.type}] ${fix.message}`);
        });
        console.log('');
      }
      
      console.log(`Summary: ${fixResults.summary.totalFixes} fixes applied`);
      break;
      
    case 'check-and-fix':
      console.log('Running checks and fixes...\n');
      const checkRes = await validator.runAllChecks();
      const fixRes = await validator.runAllFixes();
      
      console.log('🔍 CHECK RESULTS:');
      console.log(`  Errors: ${checkRes.summary.totalErrors}`);
      console.log(`  Warnings: ${checkRes.summary.totalWarnings}`);
      console.log('');
      
      console.log('🔧 FIX RESULTS:');
      console.log(`  Fixes applied: ${fixRes.summary.totalFixes}`);
      break;
      
    default:
      console.log('Usage: node checkAndFix.js <command>');
      console.log('Commands:');
      console.log('  check          - Run validation checks only');
      console.log('  fix            - Run automated fixes only');
      console.log('  check-and-fix  - Run both checks and fixes');
  }
  
  await mongoose.disconnect();
}

main().catch(console.error);