const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// Validate environment variables before starting server
const { validateAndExit } = require('./utils/env-validation');
if (!validateAndExit()) {
  console.error('❌ Environment validation failed. Server startup aborted.');
  process.exit(1);
}

const authRoutes = require('./routes/auth');
const contentRoutes = require('./routes/content');
const Admin = require('./models/Admin');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Serve uploaded files
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/content', require('./routes/content'));
app.use('/api/content', contentRoutes);

// Test route
app.get('/api/test', (req, res) => {
  res.json({ message: 'DSNL Backend API is running!' });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Error:', error);
  res.status(500).json({ 
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});

// Create default admin user
async function createDefaultAdmin() {
  try {
    const adminUsername = process.env.ADMIN_USERNAME || 'admin';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@dsnl.com';
    
    // Check if admin user already exists
    const existingAdmin = await Admin.findOne({ username: adminUsername });
    
    if (!existingAdmin) {
      const admin = new Admin({
        username: adminUsername,
        password: adminPassword,
        email: adminEmail
      });
      
      await admin.save();
      console.log(`✅ Default admin user created: ${adminUsername}`);
    } else {
      console.log(`✅ Admin user already exists: ${adminUsername}`);
    }
  } catch (error) {
    console.error('❌ Error creating default admin user:', error.message);
  }
}

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('Connected to MongoDB');
    
    // Create default admin user if it doesn't exist
    await createDefaultAdmin();
    
    // Start server
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`API available at: http://localhost:${PORT}/api`);
    });
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  });

module.exports = app;