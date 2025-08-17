#!/usr/bin/env node

/**
 * Section 7 Test Runner
 * Simple script to run Section 7 tests with different configurations
 */

const { spawn } = require('child_process');
const path = require('path');

// Parse command line arguments
const args = process.argv.slice(2);
const isHeadless = args.includes('--headless') || process.env.NODE_ENV === 'test';
const isVerbose = args.includes('--verbose') || args.includes('-v');
const isQuick = args.includes('--quick') || args.includes('-q');

console.log('🧪 Section 7 Test Runner');
console.log('='.repeat(40));

// Check if the app is running
async function checkAppRunning() {
  return new Promise((resolve) => {
    const http = require('http');
    const req = http.request({
      hostname: 'localhost',
      port: 5002,
      path: '/api/health',
      method: 'GET',
      timeout: 5000
    }, (res) => {
      resolve(res.statusCode === 200);
    });
    
    req.on('error', () => resolve(false));
    req.on('timeout', () => resolve(false));
    req.end();
  });
}

// Start the development server if not running
async function startDevServer() {
  console.log('🚀 Starting development server...');
  
  return new Promise((resolve, reject) => {
    const devProcess = spawn('npm', ['run', 'dev'], {
      stdio: isVerbose ? 'inherit' : 'pipe',
      shell: true
    });
    
    // Wait for server to start
    let attempts = 0;
    const maxAttempts = 30; // 30 seconds
    
    const checkInterval = setInterval(async () => {
      attempts++;
      const isRunning = await checkAppRunning();
      
      if (isRunning) {
        clearInterval(checkInterval);
        console.log('✅ Development server is running');
        resolve(devProcess);
      } else if (attempts >= maxAttempts) {
        clearInterval(checkInterval);
        devProcess.kill();
        reject(new Error('Failed to start development server within 30 seconds'));
      }
    }, 1000);
    
    // Handle process errors
    devProcess.on('error', (error) => {
      clearInterval(checkInterval);
      reject(error);
    });
  });
}

// Run the test
async function runTest() {
  try {
    // Check if app is already running
    const isRunning = await checkAppRunning();
    let devProcess = null;
    
    if (!isRunning) {
      devProcess = await startDevServer();
    } else {
      console.log('✅ Development server is already running');
    }
    
    // Wait a bit for the server to be fully ready
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Run the test
    console.log('\n🧪 Running Section 7 tests...');
    console.log(`Mode: ${isHeadless ? 'Headless' : 'Interactive'}`);
    console.log(`Quick mode: ${isQuick ? 'Yes' : 'No'}`);
    
    const testProcess = spawn('node', [
      path.join(__dirname, 'test-section7.js')
    ], {
      stdio: 'inherit',
      env: {
        ...process.env,
        NODE_ENV: isHeadless ? 'test' : 'development',
        NEXT_PUBLIC_APP_URL: 'http://localhost:5002'
      }
    });
    
    // Wait for test to complete
    await new Promise((resolve, reject) => {
      testProcess.on('close', (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`Test failed with exit code ${code}`));
        }
      });
      
      testProcess.on('error', reject);
    });
    
    console.log('\n✅ Section 7 tests completed successfully!');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    process.exit(1);
  } finally {
    // Clean up dev server if we started it
    if (devProcess) {
      console.log('\n🛑 Stopping development server...');
      devProcess.kill();
    }
  }
}

// Show help
function showHelp() {
  console.log(`
Usage: node scripts/run-section7-test.js [options]

Options:
  --headless    Run tests in headless mode (no browser UI)
  --verbose, -v Show detailed output
  --quick, -q   Run quick test (skip some tests)
  --help, -h    Show this help message

Examples:
  node scripts/run-section7-test.js
  node scripts/run-section7-test.js --headless
  node scripts/run-section7-test.js --verbose --quick
`);
}

// Main execution
if (args.includes('--help') || args.includes('-h')) {
  showHelp();
  process.exit(0);
}

runTest().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
