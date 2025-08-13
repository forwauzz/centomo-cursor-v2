#!/usr/bin/env node

/**
 * Environment Setup Script for CentomoMD V2
 * This script helps you create the .env.local file with the correct Supabase credentials
 */

const fs = require('fs')
const path = require('path')

const envContent = `# Supabase Configuration (Canada Central)
NEXT_PUBLIC_SUPABASE_URL=https://ogjfihvxiivakbbkyanp.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9namZpaHZ4aWl2YWtiYmt5YW5wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUwMDc0MTAsImV4cCI6MjA3MDU4MzQxMH0.0UhoM5-InXeS123QkXq02Lz5L9yuCtskpu8j2pcb3iw
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9namZpaHZ4aWl2YWtiYmt5YW5wIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTAwNzQxMCwiZXhwIjoyMDcwNTgzNDEwfQ.RSOgMuO9MEMFx8ICkz9-PzykJ6V1vhalaTp8s3n5Cuo

# Application Configuration
NEXT_PUBLIC_APP_URL=http://localhost:5002
NEXT_PUBLIC_APP_NAME=CentomoMD V2

# Security Configuration
NEXTAUTH_SECRET=your_nextauth_secret_key_here
NEXTAUTH_URL=http://localhost:5002

# Database Configuration
DATABASE_URL=postgresql://postgres.ogjfihvxiivakbbkyanp:[password]@aws-0-ca-central-1.pooler.supabase.com:6543/postgres

# Email Configuration (Optional)
SMTP_HOST=your_smtp_host
SMTP_PORT=587
SMTP_USER=your_smtp_username
SMTP_PASS=your_smtp_password

# File Storage Configuration
NEXT_PUBLIC_STORAGE_BUCKET=centomomd-v2-storage

# Analytics Configuration (Optional)
NEXT_PUBLIC_ANALYTICS_ID=your_analytics_id

# Feature Flags
NEXT_PUBLIC_ENABLE_VOICE_DICTATION=true
NEXT_PUBLIC_ENABLE_AI_ASSISTANT=true
NEXT_PUBLIC_ENABLE_REAL_TIME_COLLABORATION=true

# Compliance Configuration
NEXT_PUBLIC_COMPLIANCE_MODE=PIPEDA
NEXT_PUBLIC_DATA_RETENTION_DAYS=2555
NEXT_PUBLIC_ENABLE_AUDIT_LOGGING=true

# Development Configuration
NODE_ENV=development
NEXT_PUBLIC_DEBUG_MODE=true
`

const envPath = path.join(process.cwd(), '.env.local')

function setupEnvironment() {
  console.log('🔧 Setting up environment configuration...')
  
  try {
    // Check if .env.local already exists
    if (fs.existsSync(envPath)) {
      console.log('⚠️  .env.local already exists')
      const backupPath = path.join(process.cwd(), '.env.local.backup')
      fs.copyFileSync(envPath, backupPath)
      console.log(`📋 Backup created at: ${backupPath}`)
    }
    
    // Write the new .env.local file
    fs.writeFileSync(envPath, envContent)
    console.log('✅ .env.local created successfully')
    console.log('📍 Location:', envPath)
    
    console.log('\n🎯 Next steps:')
    console.log('1. Review the .env.local file and update any placeholder values')
    console.log('2. Generate a secure NEXTAUTH_SECRET (you can use: openssl rand -base64 32)')
    console.log('3. Start the development server: npm run dev')
    console.log('4. Check the health endpoint: http://localhost:5002/api/health')
    
  } catch (error) {
    console.error('❌ Error creating .env.local:', error.message)
    process.exit(1)
  }
}

// Run the setup
setupEnvironment()
