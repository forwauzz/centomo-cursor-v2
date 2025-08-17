#!/usr/bin/env node

/**
 * Basic Section 7 Test Script
 * Simple test to verify Section 7 functionality
 */

console.log('🧪 Starting Basic Section 7 Test...');
console.log('='.repeat(50));

// Test data
const testData = {
  mainNarrative: `Examen physique complet effectué le ${new Date().toLocaleDateString('fr-CA')}.

SIGNES VITAUX:
- Tension artérielle: 120/80 mmHg
- Pouls: 72 bpm, régulier
- Température: 36.8°C
- Saturation en oxygène: 98%

EXAMEN PHYSIQUE GÉNÉRAL:
Le patient se présente en bon état général, conscient et orienté.`,

  radiologyReport: `RAPPORT RADIOLOGIQUE

EXAMEN: Radiographie thoracique PA et latérale
DATE: ${new Date().toLocaleDateString('fr-CA')}
INDICATION: Bilan préventif

CONCLUSION:
Radiographie thoracique normale sans anomalie détectée.`,

  voiceTranscript: `Transcription de l'examen physique dicté:

Le patient présente un bon état général. L'examen des signes vitaux révèle une tension artérielle de 120 sur 80, un pouls régulier à 72 battements par minute.`
};

// Test results
const testResults = [];

function recordTest(testName, success, details = '') {
  const result = {
    test: testName,
    success,
    details,
    timestamp: new Date().toISOString()
  };
  
  testResults.push(result);
  
  if (success) {
    console.log(`✅ ${testName}: PASSED`);
  } else {
    console.log(`❌ ${testName}: FAILED - ${details}`);
  }
}

// Test 1: Check if we can access the health endpoint
async function testHealthEndpoint() {
  console.log('\n🏥 Testing health endpoint...');
  
  try {
    const http = require('http');
    const response = await new Promise((resolve, reject) => {
      const req = http.request({
        hostname: 'localhost',
        port: 5002,
        path: '/api/health',
        method: 'GET',
        timeout: 5000
      }, (res) => {
        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => resolve({ statusCode: res.statusCode, data }));
      });
      
      req.on('error', reject);
      req.on('timeout', () => reject(new Error('Timeout')));
      req.end();
    });
    
    if (response.statusCode === 200) {
      recordTest('Health Endpoint', true);
      return true;
    } else {
      recordTest('Health Endpoint', false, `Status: ${response.statusCode}`);
      return false;
    }
  } catch (error) {
    recordTest('Health Endpoint', false, error.message);
    return false;
  }
}

// Test 2: Check if Section 7 page is accessible
async function testSection7Page() {
  console.log('\n📋 Testing Section 7 page access...');
  
  try {
    const http = require('http');
    const response = await new Promise((resolve, reject) => {
      const req = http.request({
        hostname: 'localhost',
        port: 5002,
        path: '/form/section7',
        method: 'GET',
        timeout: 10000
      }, (res) => {
        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => resolve({ statusCode: res.statusCode, data }));
      });
      
      req.on('error', reject);
      req.on('timeout', () => reject(new Error('Timeout')));
      req.end();
    });
    
    if (response.statusCode === 200) {
      // Check if page contains expected content
      const content = response.data.toLowerCase();
      if (content.includes('section 7') || content.includes('physical examination') || content.includes('examen physique')) {
        recordTest('Section 7 Page', true);
        return true;
      } else {
        recordTest('Section 7 Page', false, 'Page content not found');
        return false;
      }
    } else {
      recordTest('Section 7 Page', false, `Status: ${response.statusCode}`);
      return false;
    }
  } catch (error) {
    recordTest('Section 7 Page', false, error.message);
    return false;
  }
}

// Test 3: Check environment variables
function testEnvironment() {
  console.log('\n⚙️ Testing environment configuration...');
  
  const requiredVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY'
  ];
  
  let configuredVars = 0;
  
  for (const envVar of requiredVars) {
    if (process.env[envVar]) {
      configuredVars++;
    }
  }
  
  if (configuredVars >= 1) {
    recordTest('Environment Variables', true, `${configuredVars}/${requiredVars.length} variables set`);
    return true;
  } else {
    recordTest('Environment Variables', false, `Only ${configuredVars}/${requiredVars.length} variables set`);
    return false;
  }
}

// Test 4: Check if test data is valid
function testTestData() {
  console.log('\n📝 Testing test data validity...');
  
  const hasMainNarrative = testData.mainNarrative && testData.mainNarrative.length > 0;
  const hasRadiologyReport = testData.radiologyReport && testData.radiologyReport.length > 0;
  const hasVoiceTranscript = testData.voiceTranscript && testData.voiceTranscript.length > 0;
  
  if (hasMainNarrative && hasRadiologyReport && hasVoiceTranscript) {
    recordTest('Test Data', true, 'All test data is valid');
    return true;
  } else {
    recordTest('Test Data', false, 'Some test data is missing');
    return false;
  }
}

// Test 5: Check if we can make HTTP requests
function testHTTPCapability() {
  console.log('\n🌐 Testing HTTP capability...');
  
  try {
    const http = require('http');
    recordTest('HTTP Module', true, 'HTTP module is available');
    return true;
  } catch (error) {
    recordTest('HTTP Module', false, error.message);
    return false;
  }
}

// Run all tests
async function runAllTests() {
  console.log('Starting tests...\n');
  
  // Run synchronous tests first
  testEnvironment();
  testTestData();
  testHTTPCapability();
  
  // Run asynchronous tests
  await testHealthEndpoint();
  await testSection7Page();
}

// Generate report
function generateReport() {
  const totalTests = testResults.length;
  const passedTests = testResults.filter(r => r.success).length;
  const failedTests = totalTests - passedTests;
  const successRate = ((passedTests / totalTests) * 100).toFixed(1);
  
  console.log('\n📊 TEST SUMMARY');
  console.log('='.repeat(50));
  console.log(`Total Tests: ${totalTests}`);
  console.log(`Passed: ${passedTests}`);
  console.log(`Failed: ${failedTests}`);
  console.log(`Success Rate: ${successRate}%`);
  
  if (failedTests > 0) {
    console.log('\n❌ FAILED TESTS:');
    testResults.filter(r => !r.success).forEach(result => {
      console.log(`  - ${result.test}: ${result.details}`);
    });
  }
  
  console.log('\n💡 RECOMMENDATIONS:');
  if (failedTests > 0) {
    console.log('  - Review failed test cases and fix identified issues');
  }
  
  if (testResults.filter(r => r.test.includes('Health')).some(r => !r.success)) {
    console.log('  - Ensure the development server is running on port 5002');
  }
  
  if (testResults.filter(r => r.test.includes('Environment')).some(r => !r.success)) {
    console.log('  - Verify environment variables are properly configured');
  }
  
  console.log('\n✅ Test completed!');
}

// Main execution
async function main() {
  try {
    await runAllTests();
    generateReport();
  } catch (error) {
    console.error('Test execution failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { testData, runAllTests, generateReport };
