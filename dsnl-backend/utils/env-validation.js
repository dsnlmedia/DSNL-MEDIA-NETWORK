/**
 * Backend Environment Variables Validation Utility
 * Ensures all required environment variables are set before the server starts
 */

const crypto = require('crypto');

/**
 * Required environment variables for the backend
 */
const REQUIRED_ENV_VARS = [
  'MONGODB_URI',
  'JWT_SECRET',
  'ADMIN_USERNAME',
  'ADMIN_PASSWORD',
  'ADMIN_EMAIL'
];

/**
 * Optional environment variables with defaults
 */
const OPTIONAL_ENV_VARS = {
  PORT: '5001',
  NODE_ENV: 'development',
  API_BASE_URL: 'http://localhost:5001',
  JWT_EXPIRE: '24h',
  MAX_FILE_SIZE: '52428800',
  UPLOAD_PATH: './uploads',
  CORS_ORIGINS: 'http://localhost:3000,http://localhost:5173',
  RATE_LIMIT_WINDOW_MS: '900000',
  RATE_LIMIT_MAX_REQUESTS: '100'
};

/**
 * Validates that all required environment variables are present and secure
 */
function validateEnvironment() {
  const result = {
    isValid: true,
    missingVars: [],
    invalidVars: [],
    warnings: [],
    securityIssues: []
  };

  // Check for missing required variables
  REQUIRED_ENV_VARS.forEach(varName => {
    const value = process.env[varName];
    if (!value || value.trim() === '') {
      result.missingVars.push(varName);
      result.isValid = false;
    }
  });

  // Set defaults for optional variables
  Object.entries(OPTIONAL_ENV_VARS).forEach(([varName, defaultValue]) => {
    if (!process.env[varName]) {
      process.env[varName] = defaultValue;
      result.warnings.push(`${varName} not set, using default: ${defaultValue}`);
    }
  });

  // Validate specific values
  validateSpecificValues(result);

  return result;
}

/**
 * Validates specific environment variable formats and security
 */
function validateSpecificValues(result) {
  const {
    MONGODB_URI,
    JWT_SECRET,
    ADMIN_USERNAME,
    ADMIN_PASSWORD,
    ADMIN_EMAIL,
    SESSION_SECRET,
    PORT
  } = process.env;

  // MongoDB URI validation
  if (MONGODB_URI) {
    if (!MONGODB_URI.startsWith('mongodb://') && !MONGODB_URI.startsWith('mongodb+srv://')) {
      result.invalidVars.push('MONGODB_URI (invalid MongoDB connection string)');
      result.isValid = false;
    }
  }

  // JWT Secret validation
  if (JWT_SECRET) {
    if (JWT_SECRET.includes('your_') || JWT_SECRET.includes('placeholder')) {
      result.securityIssues.push('JWT_SECRET contains placeholder text - CRITICAL SECURITY ISSUE');
      result.isValid = false;
    } else if (JWT_SECRET.length < 32) {
      result.securityIssues.push('JWT_SECRET is too short (minimum 32 characters recommended)');
      result.isValid = false;
    } else if (JWT_SECRET === 'your_jwt_secret_key_here_make_it_long_and_secure') {
      result.securityIssues.push('JWT_SECRET is using default example value - CRITICAL SECURITY ISSUE');
      result.isValid = false;
    }
  }

  // Session Secret validation
  if (SESSION_SECRET) {
    if (SESSION_SECRET.includes('your_') || SESSION_SECRET.includes('placeholder')) {
      result.securityIssues.push('SESSION_SECRET contains placeholder text');
      result.isValid = false;
    } else if (SESSION_SECRET.length < 32) {
      result.warnings.push('SESSION_SECRET is shorter than recommended (32+ characters)');
    }
  }

  // Admin credentials validation
  if (ADMIN_USERNAME) {
    if (ADMIN_USERNAME === 'admin') {
      result.securityIssues.push('ADMIN_USERNAME is using default "admin" - security risk');
    } else if (ADMIN_USERNAME.includes('your_') || ADMIN_USERNAME.includes('placeholder')) {
      result.invalidVars.push('ADMIN_USERNAME contains placeholder text');
      result.isValid = false;
    }
  }

  if (ADMIN_PASSWORD) {
    if (ADMIN_PASSWORD === 'admin123') {
      result.securityIssues.push('ADMIN_PASSWORD is using weak default password - CRITICAL SECURITY ISSUE');
      result.isValid = false;
    } else if (ADMIN_PASSWORD.includes('your_') || ADMIN_PASSWORD.includes('placeholder')) {
      result.invalidVars.push('ADMIN_PASSWORD contains placeholder text');
      result.isValid = false;
    } else if (ADMIN_PASSWORD.length < 8) {
      result.securityIssues.push('ADMIN_PASSWORD is too short (minimum 8 characters)');
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(ADMIN_PASSWORD)) {
      result.warnings.push('ADMIN_PASSWORD should contain uppercase, lowercase, and numbers');
    }
  }

  // Admin email validation
  if (ADMIN_EMAIL) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(ADMIN_EMAIL)) {
      result.invalidVars.push('ADMIN_EMAIL (invalid email format)');
      result.isValid = false;
    } else if (ADMIN_EMAIL.includes('your-') || ADMIN_EMAIL.includes('placeholder')) {
      result.invalidVars.push('ADMIN_EMAIL contains placeholder text');
      result.isValid = false;
    }
  }

  // Port validation
  if (PORT && (isNaN(PORT) || PORT < 1 || PORT > 65535)) {
    result.invalidVars.push('PORT (must be a number between 1 and 65535)');
    result.isValid = false;
  }
}

/**
 * Logs environment validation results to console
 */
function logValidationResults(result) {
  if (result.isValid && result.warnings.length === 0 && result.securityIssues.length === 0) {
    console.log('✅ All environment variables are valid and secure');
    return;
  }

  console.log('\n🔧 Environment Variables Validation Results:');
  console.log('================================================');

  if (result.missingVars.length > 0) {
    console.error('\n❌ MISSING REQUIRED VARIABLES:');
    result.missingVars.forEach(varName => {
      console.error(`   • ${varName}`);
    });
  }

  if (result.invalidVars.length > 0) {
    console.error('\n❌ INVALID VARIABLES:');
    result.invalidVars.forEach(varName => {
      console.error(`   • ${varName}`);
    });
  }

  if (result.securityIssues.length > 0) {
    console.error('\n🚨 SECURITY ISSUES:');
    result.securityIssues.forEach(issue => {
      console.error(`   • ${issue}`);
    });
  }

  if (result.warnings.length > 0) {
    console.warn('\n⚠️  WARNINGS:');
    result.warnings.forEach(warning => {
      console.warn(`   • ${warning}`);
    });
  }

  if (!result.isValid) {
    console.error('\n📋 TO FIX THESE ISSUES:');
    console.error('1. Check your .env file in the backend directory');
    console.error('2. Copy .env.example to .env if missing');
    console.error('3. Generate secure secrets using: node -e "console.log(require(\'crypto\').randomBytes(64).toString(\'hex\'))"');
    console.error('4. Update admin credentials with secure values');
    console.error('5. Refer to ENVIRONMENT_SETUP.md for detailed instructions');
    console.error('6. Restart the server after making changes\n');
    
    console.error('🚫 SERVER STARTUP BLOCKED DUE TO SECURITY ISSUES');
    process.exit(1);
  } else if (result.securityIssues.length > 0) {
    console.warn('\n⚠️  WARNING: Security issues detected but server will continue...');
    console.warn('   Please address these issues before deploying to production!\n');
  }

  console.log('================================================\n');
}

/**
 * Generates secure environment variables for development
 */
function generateSecureDefaults() {
  return {
    JWT_SECRET: crypto.randomBytes(64).toString('hex'),
    SESSION_SECRET: crypto.randomBytes(64).toString('hex')
  };
}

/**
 * Main validation function to be called on server startup
 */
function validateAndExit() {
  const result = validateEnvironment();
  logValidationResults(result);
  return result.isValid;
}

module.exports = {
  validateEnvironment,
  logValidationResults,
  generateSecureDefaults,
  validateAndExit
};