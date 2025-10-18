// This file MUST be imported first in index.ts to ensure env vars are loaded
import dotenv from 'dotenv';

// Load environment variables
const result = dotenv.config();

if (result.error) {
  console.error('❌ Error loading .env file:', result.error.message);
  console.error('Make sure .env file exists in server/ directory');
  process.exit(1);
}

// Validate required environment variables
const required = [
  'WHOOP_CLIENT_ID',
  'WHOOP_CLIENT_SECRET',
  'GROQ_API_KEY',
  'FAL_API_KEY',
  'SESSION_SECRET'
];

const missing = required.filter(key => !process.env[key]);

if (missing.length > 0) {
  console.error('❌ Missing required environment variables:');
  missing.forEach(key => console.error(`  - ${key}`));
  console.error('\nPlease check your .env file in the server/ directory');
  process.exit(1);
}

console.log('✅ Environment variables loaded successfully');
console.log('📌 WHOOP API Base URL:', process.env.WHOOP_API_BASE_URL || 'https://api.prod.whoop.com/developer/v1 (default)');
console.log('');

export {};  // Make this a module
