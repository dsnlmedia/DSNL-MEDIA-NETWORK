/**
 * Environment Variables Validation Utility
 * Ensures all required environment variables are set before the app starts
 */

interface RequiredEnvVars {
  VITE_YOUTUBE_API_KEY: string;
  VITE_YOUTUBE_CHANNEL_ID: string;
  VITE_API_BASE_URL: string;
}

interface ValidationResult {
  isValid: boolean;
  missingVars: string[];
  invalidVars: string[];
  warnings: string[];
}

/**
 * Validates that all required environment variables are present and valid
 */
export function validateEnvironment(): ValidationResult {
  const result: ValidationResult = {
    isValid: true,
    missingVars: [],
    invalidVars: [],
    warnings: []
  };

  const requiredVars: (keyof RequiredEnvVars)[] = [
    'VITE_YOUTUBE_API_KEY',
    'VITE_YOUTUBE_CHANNEL_ID', 
    'VITE_API_BASE_URL'
  ];

  // Check for missing variables
  requiredVars.forEach(varName => {
    const value = import.meta.env[varName];
    if (!value || value.trim() === '') {
      result.missingVars.push(varName);
      result.isValid = false;
    }
  });

  // Validate specific formats
  const youtubeApiKey = import.meta.env.VITE_YOUTUBE_API_KEY;
  const youtubeChannelId = import.meta.env.VITE_YOUTUBE_CHANNEL_ID;
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

  // YouTube API Key validation
  if (youtubeApiKey) {
    if (youtubeApiKey.includes('your_') || youtubeApiKey.includes('placeholder')) {
      result.invalidVars.push('VITE_YOUTUBE_API_KEY (contains placeholder text)');
      result.isValid = false;
    } else if (youtubeApiKey.length < 30) {
      result.warnings.push('VITE_YOUTUBE_API_KEY seems too short for a valid API key');
    }
  }

  // YouTube Channel ID validation
  if (youtubeChannelId) {
    if (youtubeChannelId.includes('your_') || youtubeChannelId.includes('placeholder')) {
      result.invalidVars.push('VITE_YOUTUBE_CHANNEL_ID (contains placeholder text)');
      result.isValid = false;
    } else if (!youtubeChannelId.startsWith('UC') || youtubeChannelId.length !== 24) {
      result.warnings.push('VITE_YOUTUBE_CHANNEL_ID format may be invalid (should start with UC and be 24 characters)');
    }
  }

  // API Base URL validation
  if (apiBaseUrl) {
    try {
      new URL(apiBaseUrl);
    } catch {
      result.invalidVars.push('VITE_API_BASE_URL (invalid URL format)');
      result.isValid = false;
    }
  }

  return result;
}

/**
 * Logs environment validation results to console
 */
export function logValidationResults(result: ValidationResult): void {
  if (result.isValid && result.warnings.length === 0) {
    console.log('✅ All environment variables are valid');
    return;
  }

  console.group('🔧 Environment Variables Validation');

  if (result.missingVars.length > 0) {
    console.error('❌ Missing required environment variables:');
    result.missingVars.forEach(varName => {
      console.error(`   - ${varName}`);
    });
  }

  if (result.invalidVars.length > 0) {
    console.error('❌ Invalid environment variables:');
    result.invalidVars.forEach(varName => {
      console.error(`   - ${varName}`);
    });
  }

  if (result.warnings.length > 0) {
    console.warn('⚠️  Environment variable warnings:');
    result.warnings.forEach(warning => {
      console.warn(`   - ${warning}`);
    });
  }

  if (!result.isValid) {
    console.error('\n📋 To fix these issues:');
    console.error('1. Check your .env file in the project root');
    console.error('2. Copy values from .env.backup if needed');
    console.error('3. Refer to ENVIRONMENT_SETUP.md for detailed setup instructions');
    console.error('4. Restart the development server after making changes');
  }

  console.groupEnd();
}

/**
 * Creates a user-friendly error message for missing environment variables
 */
export function createEnvironmentErrorMessage(result: ValidationResult): string {
  if (result.isValid) return '';

  let message = '🔧 Environment Configuration Required\n\n';
  
  if (result.missingVars.length > 0) {
    message += 'Missing required environment variables:\n';
    result.missingVars.forEach(varName => {
      message += `• ${varName}\n`;
    });
    message += '\n';
  }

  if (result.invalidVars.length > 0) {
    message += 'Invalid environment variables:\n';
    result.invalidVars.forEach(varName => {
      message += `• ${varName}\n`;
    });
    message += '\n';
  }

  message += 'Please check your .env file and refer to ENVIRONMENT_SETUP.md for setup instructions.';
  
  return message;
}

/**
 * Development-only function to show environment status in UI
 */
export function isDevelopmentEnvironment(): boolean {
  return import.meta.env.DEV;
}