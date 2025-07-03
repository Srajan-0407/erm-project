const mongoose = require('mongoose');
const Engineer = require('../models/Engineer');
const Project = require('../models/Project');
const Assignment = require('../models/Assignment');

class DataValidator {
  constructor() {
    this.errors = [];
    this.warnings = [];
    this.fixes = [];
  }

  addError(type, message, data) {
    this.errors.push({ type, message, data, timestamp: new Date() });
  }

  addWarning(type, message, data) {
    this.warnings.push({ type, message, data, timestamp: new Date() });
  }

  addFix(type, message, action) {
    this.fixes.push({ type, message, action, timestamp: new Date() });
  }

  async checkEngineerCapacity() {
    const engineers = await Engineer.find({ status: 'active' }).populate('assignments');
    
    for (const engineer of engineers) {
      const activeAssignments = await Assignment.find({
        engineer: engineer._id,
        status: 'active'
      });

      const totalAllocation = activeAssignments.reduce((sum, assignment) => {
        return sum + assignment.allocationPercentage;
      }, 0);

      if (totalAllocation > engineer.maxCapacity) {
        this.addError('CAPACITY_EXCEEDED', 
          `Engineer ${engineer.name} (${engineer.email}) has ${totalAllocation}% allocation, exceeding max capacity of ${engineer.maxCapacity}%`,
          { engineerId: engineer._id, totalAllocation, maxCapacity: engineer.maxCapacity });
      }

      if (totalAllocation > 100) {
        this.addError('OVER_ALLOCATION', 
          `Engineer ${engineer.name} (${engineer.email}) is over-allocated at ${totalAllocation}%`,
          { engineerId: engineer._id, totalAllocation });
      }
    }
  }

  async checkProjectDates() {
    const projects = await Project.find();
    
    for (const project of projects) {
      if (project.endDate <= project.startDate) {
        this.addError('INVALID_DATE_RANGE', 
          `Project ${project.name} has invalid date range: end date (${project.endDate}) is before or equal to start date (${project.startDate})`,
          { projectId: project._id });
      }

      if (project.status === 'active' && project.endDate < new Date()) {
        this.addWarning('OVERDUE_PROJECT', 
          `Project ${project.name} is marked as active but end date has passed`,
          { projectId: project._id, endDate: project.endDate });
      }
    }
  }

  async checkAssignmentDates() {
    const assignments = await Assignment.find().populate('project');
    
    for (const assignment of assignments) {
      if (assignment.endDate <= assignment.startDate) {
        this.addError('INVALID_ASSIGNMENT_DATE_RANGE', 
          `Assignment has invalid date range: end date (${assignment.endDate}) is before or equal to start date (${assignment.startDate})`,
          { assignmentId: assignment._id });
      }

      if (assignment.project) {
        if (assignment.startDate < assignment.project.startDate) {
          this.addError('ASSIGNMENT_BEFORE_PROJECT', 
            `Assignment starts before project start date`,
            { assignmentId: assignment._id, projectId: assignment.project._id });
        }

        if (assignment.endDate > assignment.project.endDate) {
          this.addError('ASSIGNMENT_AFTER_PROJECT', 
            `Assignment ends after project end date`,
            { assignmentId: assignment._id, projectId: assignment.project._id });
        }
      }
    }
  }

  async checkSkillMatches() {
    const assignments = await Assignment.find({ status: 'active' })
      .populate('engineer')
      .populate('project');
    
    for (const assignment of assignments) {
      if (assignment.engineer && assignment.project) {
        const engineerSkills = assignment.engineer.skills.map(skill => skill.toLowerCase());
        const requiredSkills = assignment.project.requiredSkills.map(skill => skill.toLowerCase());
        
        const missingSkills = requiredSkills.filter(skill => !engineerSkills.includes(skill));
        
        if (missingSkills.length > 0) {
          this.addWarning('SKILL_MISMATCH', 
            `Engineer ${assignment.engineer.name} missing required skills: ${missingSkills.join(', ')}`,
            { assignmentId: assignment._id, missingSkills });
        }
      }
    }
  }

  async checkOrphanedData() {
    const engineers = await Engineer.find();
    const assignments = await Assignment.find();
    
    for (const assignment of assignments) {
      const engineerExists = engineers.some(eng => eng._id.equals(assignment.engineer));
      if (!engineerExists) {
        this.addError('ORPHANED_ASSIGNMENT', 
          `Assignment references non-existent engineer`,
          { assignmentId: assignment._id, engineerId: assignment.engineer });
      }
    }
  }

  async fixOverdueProjects() {
    const overdueProjects = await Project.find({
      status: 'active',
      endDate: { $lt: new Date() }
    });

    for (const project of overdueProjects) {
      await Project.findByIdAndUpdate(project._id, { status: 'completed' });
      this.addFix('AUTO_COMPLETE_PROJECT', 
        `Automatically marked overdue project "${project.name}" as completed`,
        'status_update');
    }
  }

  async fixInactiveAssignments() {
    const inactiveAssignments = await Assignment.find({
      status: 'active',
      endDate: { $lt: new Date() }
    });

    for (const assignment of inactiveAssignments) {
      await Assignment.findByIdAndUpdate(assignment._id, { status: 'completed' });
      this.addFix('AUTO_COMPLETE_ASSIGNMENT', 
        `Automatically marked overdue assignment as completed`,
        'status_update');
    }
  }

  async cleanupOrphanedAssignments() {
    const orphanedAssignments = await Assignment.find();
    const validEngineerIds = (await Engineer.find()).map(e => e._id);
    const validProjectIds = (await Project.find()).map(p => p._id);
    
    for (const assignment of orphanedAssignments) {
      const engineerExists = validEngineerIds.some(id => id.equals(assignment.engineer));
      const projectExists = validProjectIds.some(id => id.equals(assignment.project));
      
      if (!engineerExists || !projectExists) {
        await Assignment.findByIdAndDelete(assignment._id);
        this.addFix('REMOVE_ORPHANED_ASSIGNMENT', 
          `Removed orphaned assignment`,
          'deletion');
      }
    }
  }

  async runAllChecks() {
    await this.checkEngineerCapacity();
    await this.checkProjectDates();
    await this.checkAssignmentDates();
    await this.checkSkillMatches();
    await this.checkOrphanedData();
    
    return {
      errors: this.errors,
      warnings: this.warnings,
      summary: {
        totalErrors: this.errors.length,
        totalWarnings: this.warnings.length,
        timestamp: new Date()
      }
    };
  }

  async runAllFixes() {
    await this.fixOverdueProjects();
    await this.fixInactiveAssignments();
    await this.cleanupOrphanedAssignments();
    
    return {
      fixes: this.fixes,
      summary: {
        totalFixes: this.fixes.length,
        timestamp: new Date()
      }
    };
  }
}

module.exports = DataValidator;