const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/engineering-management', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

// Routes - using correct relative paths for Vercel
app.use('/api/auth', require('../server/routes/auth'));
app.use('/api/engineers', require('../server/routes/engineers'));
app.use('/api/projects', require('../server/routes/projects'));
app.use('/api/assignments', require('../server/routes/assignments'));

// Export for Vercel serverless function
module.exports = app; 