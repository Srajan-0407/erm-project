const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Engineer = require('./models/Engineer');
const Project = require('./models/Project');
const Assignment = require('./models/Assignment');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/engineering-management');
    console.log('MongoDB Connected');
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
};

const seedData = async () => {
  try {
    // Clear existing data
    await User.deleteMany({});
    await Engineer.deleteMany({});
    await Project.deleteMany({});
    await Assignment.deleteMany({});

    // Create users
    const managerUser = new User({
      name: 'John Manager',
      email: 'manager@company.com',
      password: 'password123',
      role: 'manager',
      department: 'Management',
    });
    await managerUser.save();

    const engineerUsers = [
      { name: 'Alice Johnson', email: 'alice@company.com', password: 'password123', role: 'engineer', department: 'Frontend' },
      { name: 'Bob Smith', email: 'bob@company.com', password: 'password123', role: 'engineer', department: 'Backend' },
      { name: 'Carol Davis', email: 'carol@company.com', password: 'password123', role: 'engineer', department: 'Frontend' },
      { name: 'David Wilson', email: 'david@company.com', password: 'password123', role: 'engineer', department: 'Backend' },
      { name: 'Eve Brown', email: 'eve@company.com', password: 'password123', role: 'engineer', department: 'DevOps'   },
    ];

    const createdEngineerUsers = [];
    for (const userData of engineerUsers) {
      const user = new User(userData);
      await user.save();
      createdEngineerUsers.push(user);
    }

    // Create engineers
    const engineers = [
      {
        user: createdEngineerUsers[0]._id,
        name: 'Alice Johnson',
        email: 'alice@company.com',
        skills: ['JavaScript', 'React', 'Node.js', 'TypeScript'],
        seniority: 'senior',
        department: 'Frontend',
        maxCapacity: 100,
      },
      {
        user: createdEngineerUsers[1]._id,
        name: 'Bob Smith',
        email: 'bob@company.com',
        skills: ['Python', 'Django', 'PostgreSQL', 'Docker'],
        seniority: 'mid',
        department: 'Backend',
        maxCapacity: 100,
      },
      {
        user: createdEngineerUsers[2]._id,
        name: 'Carol Davis',
        email: 'carol@company.com',
        skills: ['JavaScript', 'Vue.js', 'CSS', 'UI/UX Design'],
        seniority: 'junior',
        department: 'Frontend',
        maxCapacity: 80,
      },
      {
        user: createdEngineerUsers[3]._id,
        name: 'David Wilson',
        email: 'david@company.com',
        skills: ['Java', 'Spring Boot', 'Microservices', 'Kubernetes'],
        seniority: 'lead',
        department: 'Backend',
        maxCapacity: 100,
      },
      {
        user: createdEngineerUsers[4]._id,
        name: 'Eve Brown',
        email: 'eve@company.com',
        skills: ['AWS', 'DevOps', 'CI/CD', 'Terraform'],
        seniority: 'senior',
        department: 'DevOps',
        maxCapacity: 100,
      },
    ];

    const createdEngineers = [];
    for (const engineerData of engineers) {
      const engineer = new Engineer(engineerData);
      await engineer.save();
      createdEngineers.push(engineer);
    }

    // Create projects
    const projects = [
      {
        name: 'E-commerce Platform',
        description: 'Build a modern e-commerce platform with React and Node.js',
        startDate: new Date('2024-01-15'),
        endDate: new Date('2024-06-15'),
        status: 'active',
        requiredSkills: ['JavaScript', 'React', 'Node.js', 'MongoDB'],
        teamSize: 4,
        priority: 'high',
        manager: managerUser._id,
      },
      {
        name: 'Mobile App Development',
        description: 'Develop a cross-platform mobile application',
        startDate: new Date('2024-02-01'),
        endDate: new Date('2024-08-01'),
        status: 'planning',
        requiredSkills: ['React Native', 'JavaScript', 'Mobile Development'],
        teamSize: 3,
        priority: 'medium',
        manager: managerUser._id,
      },
      {
        name: 'Data Analytics Dashboard',
        description: 'Create a real-time analytics dashboard for business intelligence',
        startDate: new Date('2024-03-01'),
        endDate: new Date('2024-07-01'),
        status: 'active',
        requiredSkills: ['Python', 'Data Analysis', 'React', 'PostgreSQL'],
        teamSize: 2,
        priority: 'medium',
        manager: managerUser._id,
      },
      {
        name: 'Infrastructure Modernization',
        description: 'Migrate legacy systems to cloud infrastructure',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        status: 'active',
        requiredSkills: ['AWS', 'DevOps', 'Kubernetes', 'Docker'],
        teamSize: 2,
        priority: 'critical',
        manager: managerUser._id,
      },
    ];

    const createdProjects = [];
    for (const projectData of projects) {
      const project = new Project(projectData);
      await project.save();
      createdProjects.push(project);
    }

    // Create assignments
    const assignments = [
      {
        engineer: createdEngineers[0]._id, // Alice - React/Node.js
        project: createdProjects[0]._id,   // E-commerce Platform
        allocationPercentage: 80,
        startDate: new Date('2024-01-15'),
        endDate: new Date('2024-06-15'),
        status: 'active',
        role: 'Frontend Lead',
        assignedBy: managerUser._id,
      },
      {
        engineer: createdEngineers[1]._id, // Bob - Python/Backend
        project: createdProjects[2]._id,   // Analytics Dashboard
        allocationPercentage: 60,
        startDate: new Date('2024-03-01'),
        endDate: new Date('2024-07-01'),
        status: 'active',
        role: 'Backend Developer',
        assignedBy: managerUser._id,
      },
      {
        engineer: createdEngineers[2]._id, // Carol - Vue.js/CSS
        project: createdProjects[0]._id,   // E-commerce Platform
        allocationPercentage: 70,
        startDate: new Date('2024-01-15'),
        endDate: new Date('2024-06-15'),
        status: 'active',
        role: 'UI/UX Developer',
        assignedBy: managerUser._id,
      },
      {
        engineer: createdEngineers[3]._id, // David - Java/Microservices
        project: createdProjects[0]._id,   // E-commerce Platform
        allocationPercentage: 50,
        startDate: new Date('2024-01-15'),
        endDate: new Date('2024-06-15'),
        status: 'active',
        role: 'Tech Lead',
        assignedBy: managerUser._id,
      },
      {
        engineer: createdEngineers[4]._id, // Eve - DevOps/AWS
        project: createdProjects[3]._id,   // Infrastructure Modernization
        allocationPercentage: 90,
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        status: 'active',
        role: 'DevOps Lead',
        assignedBy: managerUser._id,
      },
    ];

    for (const assignmentData of assignments) {
      const assignment = new Assignment(assignmentData);
      await assignment.save();
    }

    console.log('✅ Sample data seeded successfully!');
    console.log('📋 Login credentials:');
    console.log('   Manager: manager@company.com / password123');
    console.log('   Engineers: alice@company.com, bob@company.com, etc. / password123');

  } catch (error) {
    console.error('❌ Error seeding data:', error);
  }
};

const runSeed = async () => {
  await connectDB();
  await seedData();
  process.exit(0);
};

if (require.main === module) {
  runSeed();
}

module.exports = { seedData };