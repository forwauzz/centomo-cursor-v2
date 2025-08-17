#!/usr/bin/env node

/**
 * Simple Section 7 Test Script
 * Tests Section 7 functionality using HTTP requests and basic checks
 * No browser automation required
 */

const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');

// Test configuration
const TEST_CONFIG = {
  baseUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:5002',
  timeout: 10000
};

// Test data for Section 7
const TEST_DATA = {
  mainNarrative: `Examen physique complet effectué le ${new Date().toLocaleDateString('fr-CA')}.

SIGNES VITAUX:
- Tension artérielle: 120/80 mmHg
- Pouls: 72 bpm, régulier
- Température: 36.8°C
- Saturation en oxygène: 98%

EXAMEN PHYSIQUE GÉNÉRAL:
Le patient se présente en bon état général, conscient et orienté. Pas de signes de détresse respiratoire ou circulatoire.`,

  radiologyReport: `RAPPORT RADIOLOGIQUE

EXAMEN: Radiographie thoracique PA et latérale
DATE: ${new Date().toLocaleDateString('fr-CA')}
INDICATION: Bilan préventif

CONCLUSION:
Radiographie thoracique normale sans anomalie détectée.`,

  voiceTranscript: `Transcription de l'examen physique dicté:

Le patient présente un bon état général. L'examen des signes vitaux révèle une tension artérielle de 120 sur 80, un pouls régulier à 72 battements par minute, une température de 36,8 degrés Celsius et une saturation en oxygène de 98 pour cent.`
};

class SimpleSection7Tester {
  constructor() {
    this.testResults = [];
    this.startTime = Date.now();
  }

  async recordTestResult(testName, success, details = '') {
    const result = {
      test: testName,
      success,
      details,
      timestamp: new Date().toISOString(),
      duration: Date.now() - this.startTime
    };
    
    this.testResults.push(result);
    
    if (success) {
      console.log(`✅ ${testName}: PASSED`);
    } else {
      console.log(`❌ ${testName}: FAILED - ${details}`);
    }
  }

  async makeRequest(url, options = {}) {
    return new Promise((resolve, reject) => {
      const urlObj = new URL(url);
      const isHttps = urlObj.protocol === 'https:';
      const client = isHttps ? https : http;
      
      const requestOptions = {
        hostname: urlObj.hostname,
        port: urlObj.port || (isHttps ? 443 : 80),
        path: urlObj.pathname + urlObj.search,
        method: options.method || 'GET',
        headers: {
          'User-Agent': 'Section7-Test-Script/1.0',
          'Accept': 'text/html,application/json',
          'Content-Type': 'application/json',
          ...options.headers
        },
        timeout: TEST_CONFIG.timeout
      };

      const req = client.request(requestOptions, (res) => {
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });
        res.on('end', () => {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            data: data
          });
        });
      });

      req.on('error', (error) => {
        reject(error);
      });

      req.on('timeout', () => {
        req.destroy();
        reject(new Error('Request timeout'));
      });

      if (options.body) {
        req.write(JSON.stringify(options.body));
      }

      req.end();
    });
  }

  async testServerHealth() {
    try {
      console.log('🏥 Testing server health...');
      
      const response = await this.makeRequest(`${TEST_CONFIG.baseUrl}/api/health`);
      
      if (response.statusCode === 200) {
        await this.recordTestResult('Server Health', true);
        return true;
      } else {
        await this.recordTestResult('Server Health', false, `Status: ${response.statusCode}`);
        return false;
      }
    } catch (error) {
      await this.recordTestResult('Server Health', false, error.message);
      return false;
    }
  }

  async testSection7PageAccess() {
    try {
      console.log('📋 Testing Section 7 page access...');
      
      const response = await this.makeRequest(`${TEST_CONFIG.baseUrl}/form/section7`);
      
      if (response.statusCode === 200) {
        // Check if the page contains expected content
        const content = response.data.toLowerCase();
        const hasSection7Content = content.includes('section 7') || 
                                  content.includes('physical examination') ||
                                  content.includes('examen physique');
        
        if (hasSection7Content) {
          await this.recordTestResult('Section 7 Page Access', true);
          return true;
        } else {
          await this.recordTestResult('Section 7 Page Access', false, 'Page content not found');
          return false;
        }
      } else {
        await this.recordTestResult('Section 7 Page Access', false, `Status: ${response.statusCode}`);
        return false;
      }
    } catch (error) {
      await this.recordTestResult('Section 7 Page Access', false, error.message);
      return false;
    }
  }

  async testAPIEndpoints() {
    try {
      console.log('🔌 Testing API endpoints...');
      
      const endpoints = [
        '/api/format/main-narrative',
        '/api/format/radiology-report',
        '/api/format/voice-transcript',
        '/api/format/compile-section',
        '/api/voice/record',
        '/api/voice-status'
      ];
      
      let workingEndpoints = 0;
      
      for (const endpoint of endpoints) {
        try {
          const response = await this.makeRequest(`${TEST_CONFIG.baseUrl}${endpoint}`, {
            method: 'POST',
            body: { test: true }
          });
          
          // Accept 200 (success) or 400/422 (validation error) as working endpoints
          if (response.statusCode === 200 || response.statusCode === 400 || response.statusCode === 422) {
            workingEndpoints++;
          }
        } catch (error) {
          // Endpoint might not exist or be accessible, which is okay for this test
        }
      }
      
      if (workingEndpoints >= 2) { // At least 2 endpoints should be accessible
        await this.recordTestResult('API Endpoints', true, `${workingEndpoints}/${endpoints.length} endpoints accessible`);
        return true;
      } else {
        await this.recordTestResult('API Endpoints', false, `Only ${workingEndpoints}/${endpoints.length} endpoints accessible`);
        return false;
      }
    } catch (error) {
      await this.recordTestResult('API Endpoints', false, error.message);
      return false;
    }
  }

  async testFormSessionAPI() {
    try {
      console.log('💾 Testing form session API...');
      
      const response = await this.makeRequest(`${TEST_CONFIG.baseUrl}/api/form-sessions`, {
        method: 'POST',
        body: {
          section: 'section7',
          data: {
            mainNarrative: TEST_DATA.mainNarrative,
            radiologyReport: TEST_DATA.radiologyReport,
            transcript: TEST_DATA.voiceTranscript
          }
        }
      });
      
      if (response.statusCode === 200 || response.statusCode === 201) {
        await this.recordTestResult('Form Session API', true);
        return true;
      } else {
        await this.recordTestResult('Form Session API', false, `Status: ${response.statusCode}`);
        return false;
      }
    } catch (error) {
      await this.recordTestResult('Form Session API', false, error.message);
      return false;
    }
  }

  async testVoiceAPI() {
    try {
      console.log('🎤 Testing voice API...');
      
      const response = await this.makeRequest(`${TEST_CONFIG.baseUrl}/api/voice-status`);
      
      if (response.statusCode === 200) {
        await this.recordTestResult('Voice API', true);
        return true;
      } else {
        await this.recordTestResult('Voice API', false, `Status: ${response.statusCode}`);
        return false;
      }
    } catch (error) {
      await this.recordTestResult('Voice API', false, error.message);
      return false;
    }
  }

  async testStaticAssets() {
    try {
      console.log('📦 Testing static assets...');
      
      const assets = [
        '/globals.css',
        '/manifest.json'
      ];
      
      let accessibleAssets = 0;
      
      for (const asset of assets) {
        try {
          const response = await this.makeRequest(`${TEST_CONFIG.baseUrl}${asset}`);
          if (response.statusCode === 200) {
            accessibleAssets++;
          }
        } catch (error) {
          // Asset might not exist, which is okay
        }
      }
      
      if (accessibleAssets >= 1) { // At least 1 asset should be accessible
        await this.recordTestResult('Static Assets', true, `${accessibleAssets}/${assets.length} assets accessible`);
        return true;
      } else {
        await this.recordTestResult('Static Assets', false, `Only ${accessibleAssets}/${assets.length} assets accessible`);
        return false;
      }
    } catch (error) {
      await this.recordTestResult('Static Assets', false, error.message);
      return false;
    }
  }

  async testEnvironmentConfiguration() {
    try {
      console.log('⚙️ Testing environment configuration...');
      
      // Check if required environment variables are set
      const requiredEnvVars = [
        'NEXT_PUBLIC_SUPABASE_URL',
        'NEXT_PUBLIC_SUPABASE_ANON_KEY'
      ];
      
      let configuredVars = 0;
      
      for (const envVar of requiredEnvVars) {
        if (process.env[envVar]) {
          configuredVars++;
        }
      }
      
      if (configuredVars >= 1) { // At least 1 should be configured
        await this.recordTestResult('Environment Configuration', true, `${configuredVars}/${requiredEnvVars.length} variables set`);
        return true;
      } else {
        await this.recordTestResult('Environment Configuration', false, `Only ${configuredVars}/${requiredEnvVars.length} variables set`);
        return false;
      }
    } catch (error) {
      await this.recordTestResult('Environment Configuration', false, error.message);
      return false;
    }
  }

  async runAllTests() {
    console.log('🧪 Starting Section 7 Simple Test Suite...\n');
    
    const tests = [
      this.testServerHealth.bind(this),
      this.testSection7PageAccess.bind(this),
      this.testAPIEndpoints.bind(this),
      this.testFormSessionAPI.bind(this),
      this.testVoiceAPI.bind(this),
      this.testStaticAssets.bind(this),
      this.testEnvironmentConfiguration.bind(this)
    ];
    
    for (const test of tests) {
      try {
        await test();
        await new Promise(resolve => setTimeout(resolve, 1000)); // Brief pause between tests
      } catch (error) {
        console.error(`Test failed with error:`, error);
      }
    }
  }

  async generateReport() {
    const totalTests = this.testResults.length;
    const passedTests = this.testResults.filter(r => r.success).length;
    const failedTests = totalTests - passedTests;
    const successRate = ((passedTests / totalTests) * 100).toFixed(1);
    
    const report = {
      summary: {
        totalTests,
        passedTests,
        failedTests,
        successRate: `${successRate}%`,
        duration: `${((Date.now() - this.startTime) / 1000).toFixed(1)}s`,
        timestamp: new Date().toISOString(),
        testType: 'Simple HTTP Tests'
      },
      results: this.testResults,
      recommendations: this.generateRecommendations()
    };
    
    // Save report to file
    const reportPath = path.join(__dirname, 'section7-simple-test-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    // Print summary
    console.log('\n📊 TEST SUMMARY');
    console.log('='.repeat(50));
    console.log(`Total Tests: ${totalTests}`);
    console.log(`Passed: ${passedTests}`);
    console.log(`Failed: ${failedTests}`);
    console.log(`Success Rate: ${successRate}%`);
    console.log(`Duration: ${report.summary.duration}`);
    console.log(`Report saved to: ${reportPath}`);
    
    if (failedTests > 0) {
      console.log('\n❌ FAILED TESTS:');
      this.testResults.filter(r => !r.success).forEach(result => {
        console.log(`  - ${result.test}: ${result.details}`);
      });
    }
    
    if (report.recommendations.length > 0) {
      console.log('\n💡 RECOMMENDATIONS:');
      report.recommendations.forEach(rec => {
        console.log(`  - ${rec}`);
      });
    }
    
    return report;
  }

  generateRecommendations() {
    const recommendations = [];
    const failedTests = this.testResults.filter(r => !r.success);
    
    if (failedTests.length > 0) {
      recommendations.push('Review failed test cases and fix identified issues');
    }
    
    if (this.testResults.filter(r => r.test.includes('Server')).some(r => !r.success)) {
      recommendations.push('Ensure the development server is running on port 5002');
    }
    
    if (this.testResults.filter(r => r.test.includes('API')).some(r => !r.success)) {
      recommendations.push('Check API endpoint implementations and authentication');
    }
    
    if (this.testResults.filter(r => r.test.includes('Environment')).some(r => !r.success)) {
      recommendations.push('Verify environment variables are properly configured');
    }
    
    return recommendations;
  }
}

// Main execution
async function main() {
  const tester = new SimpleSection7Tester();
  
  try {
    await tester.runAllTests();
    await tester.generateReport();
    
  } catch (error) {
    console.error('Test execution failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { SimpleSection7Tester, TEST_DATA };
