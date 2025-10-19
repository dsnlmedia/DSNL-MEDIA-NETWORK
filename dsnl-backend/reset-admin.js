/**
 * Admin User Reset Script
 * This script will delete the existing admin user and create a new one with current .env credentials
 */

require('dotenv').config();
const mongoose = require('mongoose');

// Import Admin model (assuming it exists)
const Admin = require('./models/Admin');

async function resetAdminUser() {
  try {
    console.log('🔧 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Get credentials from environment
    const adminUsername = process.env.ADMIN_USERNAME || 'dsnl_admin';
    const adminPassword = process.env.ADMIN_PASSWORD || 'DSNL@2024!SecureP@ss';
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@dsnlmedia.com';

    console.log('🗑️  Removing existing admin users...');
    await Admin.deleteMany({});
    console.log('✅ Existing admin users removed');

    console.log('👤 Creating new admin user...');
    const admin = new Admin({
      username: adminUsername,
      password: adminPassword, // The model should hash this automatically
      email: adminEmail
    });

    await admin.save();
    console.log('✅ New admin user created successfully!');
    
    console.log('');
    console.log('🔐 LOGIN CREDENTIALS:');
    console.log('====================');
    console.log(`Username: ${adminUsername}`);
    console.log(`Password: ${adminPassword}`);
    console.log(`Email: ${adminEmail}`);
    console.log('');
    console.log('🚀 You can now log in to the admin dashboard!');

  } catch (error) {
    console.error('❌ Error resetting admin user:', error.message);
    
    if (error.message.includes('Admin')) {
      console.log('');
      console.log('💡 If the Admin model is not found, make sure:');
      console.log('1. The backend server has been started at least once');
      console.log('2. The models/Admin.js file exists');
      console.log('3. The database connection is working');
    }
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
    process.exit(0);
  }
}

// Run the reset
resetAdminUser();