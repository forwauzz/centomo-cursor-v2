#!/usr/bin/env node

/**
 * Environment Setup Script for CentomoMD V2
 * This script helps you create the .env.local file with the correct Supabase credentials
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 Setting up CentomoMD V2 environment...');

const envPath = path.join(process.cwd(), '.env.local');
const envExamplePath = path.join(process.cwd(), 'env.example');

// Check if .env.local already exists
if (fs.existsSync(envPath)) {
  console.log('✅ .env.local already exists');
  return;
}

// Read the example file
if (!fs.existsSync(envExamplePath)) {
  console.error('❌ env.example not found');
  process.exit(1);
}

const envExample = fs.readFileSync(envExamplePath, 'utf8');

// Create a basic .env.local with placeholder values
const envContent = envExample
  .replace(/your_supabase_project_url/g, 'https://your-project.supabase.co')
  .replace(/your_supabase_anon_key/g, 'your_supabase_anon_key_here')
  .replace(/your_supabase_service_role_key/g, 'your_supabase_service_role_key_here')
  .replace(/your_nextauth_secret_key/g, 'your_nextauth_secret_key_here')
  .replace(/your_database_connection_string/g, 'your_database_connection_string_here');

try {
  fs.writeFileSync(envPath, envContent);
  console.log('✅ Created .env.local with placeholder values');
  console.log('📝 Please update .env.local with your actual Supabase credentials');
  console.log('🔗 Get your credentials from: https://supabase.com/dashboard');
} catch (error) {
  console.error('❌ Failed to create .env.local:', error.message);
  process.exit(1);
}
