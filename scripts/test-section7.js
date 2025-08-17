#!/usr/bin/env node

/**
 * Section 7 Test Script
 * Simulates user interactions with the Physical Examination section
 * Tests form functionality, voice recording, AI formatting, and data persistence
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// Test configuration
const TEST_CONFIG = {
  baseUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:5002',
  timeout: 30000,
  headless: false, // Set to true for CI/CD
  slowMo: 100, // Slow down actions for visibility
  viewport: { width: 1920, height: 1080 }
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
Le patient se présente en bon état général, conscient et orienté. Pas de signes de détresse respiratoire ou circulatoire.

EXAMEN MUSCULO-SQUELETTIQUE:
- Mobilité active et passive normale des articulations principales
- Force musculaire 5/5 dans les quatre membres
- Pas de déformation articulaire visible
- Amplitude de mouvement complète pour toutes les articulations testées

EXAMEN NEUROLOGIQUE:
- Fonctions cognitives intactes
- Nerfs crâniens I-XII intacts
- Réflexes ostéotendineux normaux et symétriques
- Sensibilité normale dans tous les dermatomes

EXAMEN CARDIOVASCULAIRE:
- Rythme cardiaque régulier
- Pas de souffle cardiaque
- Pouls périphériques palpables et symétriques

EXAMEN RESPIRATOIRE:
- Respiration régulière et non laborieuse
- Auscultation pulmonaire normale
- Pas de râles, sibilances ou crépitements

CONCLUSION:
Examen physique normal sans anomalie détectée.`,

  radiologyReport: `RAPPORT RADIOLOGIQUE

EXAMEN: Radiographie thoracique PA et latérale
DATE: ${new Date().toLocaleDateString('fr-CA')}
INDICATION: Bilan préventif

TECHNIQUE:
Radiographies thoraciques PA et latérale en position debout, inspiration complète.

CLICHÉS:
- Vue PA: Technique satisfaisante, inspiration complète
- Vue latérale: Technique satisfaisante

ANALYSE:
CŒUR ET MÉDIASTIN:
- Silhouette cardiaque de taille normale
- Index cardio-thoracique < 0.5
- Pas d'élargissement médiastinal

POUMONS:
- Champs pulmonaires clairs
- Pas d'opacité anormale
- Pas d'épanchement pleural visible
- Culs-de-sac costo-diaphragmatiques libres

CÔTES ET PAROI THORACIQUE:
- Côtes intactes
- Pas de fracture visible
- Paroi thoracique normale

DIAPHRAGME:
- Dômes diaphragmatiques bien visibles
- Pas d'ascension anormale

CONCLUSION:
Radiographie thoracique normale sans anomalie détectée.`,

  measurements: [
    { type: 'height', value: '175', unit: 'cm', side: 'bilateral', notes: 'Mesure standard' },
    { type: 'weight', value: '70', unit: 'kg', side: 'bilateral', notes: 'Poids stable' },
    { type: 'blood_pressure', value: '120/80', unit: 'mmHg', side: 'bilateral', notes: 'Normale' },
    { type: 'temperature', value: '36.8', unit: '°C', side: 'bilateral', notes: 'Normale' },
    { type: 'pulse', value: '72', unit: 'bpm', side: 'bilateral', notes: 'Régulier' },
    { type: 'oxygen_saturation', value: '98', unit: '%', side: 'bilateral', notes: 'Excellente' }
  ],

  voiceTranscript: `Transcription de l'examen physique dicté:

Le patient présente un bon état général. L'examen des signes vitaux révèle une tension artérielle de 120 sur 80, un pouls régulier à 72 battements par minute, une température de 36,8 degrés Celsius et une saturation en oxygène de 98 pour cent.

L'examen musculo-squelettique montre une mobilité normale de toutes les articulations principales avec une force musculaire de 5 sur 5 dans les quatre membres. Pas de déformation articulaire visible et l'amplitude de mouvement est complète pour toutes les articulations testées.

L'examen neurologique révèle des fonctions cognitives intactes, les nerfs crâniens de 1 à 12 sont intacts, les réflexes ostéotendineux sont normaux et symétriques, et la sensibilité est normale dans tous les dermatomes.

L'examen cardiovasculaire montre un rythme cardiaque régulier sans souffle cardiaque et les pouls périphériques sont palpables et symétriques.

L'examen respiratoire révèle une respiration régulière et non laborieuse, une auscultation pulmonaire normale sans râles, sibilances ou crépitements.

En conclusion, l'examen physique est normal sans anomalie détectée.`
};

class Section7Tester {
  constructor() {
    this.browser = null;
    this.page = null;
    this.testResults = [];
    this.startTime = Date.now();
  }

  async initialize() {
    console.log('🚀 Initializing Section 7 Test...');
    
    try {
      this.browser = await puppeteer.launch({
        headless: TEST_CONFIG.headless,
        slowMo: TEST_CONFIG.slowMo,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--disable-gpu'
        ]
      });

      this.page = await this.browser.newPage();
      await this.page.setViewport(TEST_CONFIG.viewport);
      await this.page.setDefaultTimeout(TEST_CONFIG.timeout);

      // Enable console logging from the page
      this.page.on('console', msg => {
        if (msg.type() === 'error') {
          console.log('Page Error:', msg.text());
        }
      });

      console.log('✅ Browser initialized successfully');
      return true;
    } catch (error) {
      console.error('❌ Failed to initialize browser:', error);
      return false;
    }
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

  async navigateToSection7() {
    try {
      console.log('📋 Navigating to Section 7...');
      
      // Navigate to the main page first
      await this.page.goto(TEST_CONFIG.baseUrl);
      await this.page.waitForSelector('body', { timeout: 10000 });
      
      // Wait for the page to load
      await this.page.waitForTimeout(2000);
      
      // Navigate to Section 7
      await this.page.goto(`${TEST_CONFIG.baseUrl}/form/section7`);
      await this.page.waitForSelector('h1', { timeout: 10000 });
      
      // Verify we're on the correct page
      const pageTitle = await this.page.$eval('h1', el => el.textContent);
      if (pageTitle.includes('Section 7: Physical Examination')) {
        await this.recordTestResult('Navigate to Section 7', true);
        return true;
      } else {
        await this.recordTestResult('Navigate to Section 7', false, 'Wrong page title');
        return false;
      }
    } catch (error) {
      await this.recordTestResult('Navigate to Section 7', false, error.message);
      return false;
    }
  }

  async testFormLoading() {
    try {
      console.log('📝 Testing form loading...');
      
      // Wait for form elements to load
      await this.page.waitForSelector('textarea', { timeout: 10000 });
      await this.page.waitForSelector('button', { timeout: 10000 });
      
      // Check if main narrative textarea is present
      const textareaExists = await this.page.$('textarea[placeholder*="main physical examination"]');
      if (textareaExists) {
        await this.recordTestResult('Form Loading', true);
        return true;
      } else {
        await this.recordTestResult('Form Loading', false, 'Main narrative textarea not found');
        return false;
      }
    } catch (error) {
      await this.recordTestResult('Form Loading', false, error.message);
      return false;
    }
  }

  async testMainNarrativeInput() {
    try {
      console.log('✍️ Testing main narrative input...');
      
      // Find and fill the main narrative textarea
      const textarea = await this.page.$('textarea[placeholder*="main physical examination"]');
      if (!textarea) {
        await this.recordTestResult('Main Narrative Input', false, 'Textarea not found');
        return false;
      }
      
      // Clear existing content and type new content
      await textarea.click();
      await textarea.evaluate(el => el.value = '');
      await textarea.type(TEST_DATA.mainNarrative, { delay: 10 });
      
      // Verify content was entered
      const content = await textarea.evaluate(el => el.value);
      if (content.includes('Examen physique complet')) {
        await this.recordTestResult('Main Narrative Input', true);
        return true;
      } else {
        await this.recordTestResult('Main Narrative Input', false, 'Content not properly entered');
        return false;
      }
    } catch (error) {
      await this.recordTestResult('Main Narrative Input', false, error.message);
      return false;
    }
  }

  async testRadiologyReportInput() {
    try {
      console.log('🧠 Testing radiology report input...');
      
      // Scroll to radiology report section
      await this.page.evaluate(() => {
        const radiologySection = document.querySelector('h3:contains("Radiology Report")') || 
                                document.querySelector('[class*="radiology"]') ||
                                document.querySelector('h3');
        if (radiologySection) {
          radiologySection.scrollIntoView({ behavior: 'smooth' });
        }
      });
      
      await this.page.waitForTimeout(1000);
      
      // Find radiology report textarea
      const textareas = await this.page.$$('textarea');
      let radiologyTextarea = null;
      
      for (const textarea of textareas) {
        const placeholder = await textarea.evaluate(el => el.placeholder);
        if (placeholder && placeholder.includes('radiology')) {
          radiologyTextarea = textarea;
          break;
        }
      }
      
      if (!radiologyTextarea) {
        await this.recordTestResult('Radiology Report Input', false, 'Radiology textarea not found');
        return false;
      }
      
      // Fill radiology report
      await radiologyTextarea.click();
      await radiologyTextarea.evaluate(el => el.value = '');
      await radiologyTextarea.type(TEST_DATA.radiologyReport, { delay: 10 });
      
      // Verify content
      const content = await radiologyTextarea.evaluate(el => el.value);
      if (content.includes('RAPPORT RADIOLOGIQUE')) {
        await this.recordTestResult('Radiology Report Input', true);
        return true;
      } else {
        await this.recordTestResult('Radiology Report Input', false, 'Content not properly entered');
        return false;
      }
    } catch (error) {
      await this.recordTestResult('Radiology Report Input', false, error.message);
      return false;
    }
  }

  async testVoiceTranscriptInput() {
    try {
      console.log('🎤 Testing voice transcript input...');
      
      // Scroll to voice transcript section
      await this.page.evaluate(() => {
        const transcriptSection = document.querySelector('h3:contains("Voice Transcript")') || 
                                 document.querySelector('[class*="transcript"]') ||
                                 document.querySelector('h3:last-child');
        if (transcriptSection) {
          transcriptSection.scrollIntoView({ behavior: 'smooth' });
        }
      });
      
      await this.page.waitForTimeout(1000);
      
      // Find voice transcript textarea
      const textareas = await this.page.$$('textarea');
      let transcriptTextarea = null;
      
      for (const textarea of textareas) {
        const placeholder = await textarea.evaluate(el => el.placeholder);
        if (placeholder && placeholder.includes('Voice recording transcript')) {
          transcriptTextarea = textarea;
          break;
        }
      }
      
      if (!transcriptTextarea) {
        await this.recordTestResult('Voice Transcript Input', false, 'Transcript textarea not found');
        return false;
      }
      
      // Fill voice transcript
      await transcriptTextarea.click();
      await transcriptTextarea.evaluate(el => el.value = '');
      await transcriptTextarea.type(TEST_DATA.voiceTranscript, { delay: 10 });
      
      // Verify content
      const content = await transcriptTextarea.evaluate(el => el.value);
      if (content.includes('Transcription de l\'examen physique')) {
        await this.recordTestResult('Voice Transcript Input', true);
        return true;
      } else {
        await this.recordTestResult('Voice Transcript Input', false, 'Content not properly entered');
        return false;
      }
    } catch (error) {
      await this.recordTestResult('Voice Transcript Input', false, error.message);
      return false;
    }
  }

  async testVoiceRecordingButton() {
    try {
      console.log('🎙️ Testing voice recording button...');
      
      // Find the voice recording button
      const recordingButton = await this.page.$('button:has-text("Start Recording")') ||
                             await this.page.$('button:has-text("Start")');
      
      if (!recordingButton) {
        await this.recordTestResult('Voice Recording Button', false, 'Recording button not found');
        return false;
      }
      
      // Check if button is clickable
      const isDisabled = await recordingButton.evaluate(el => el.disabled);
      if (isDisabled) {
        await this.recordTestResult('Voice Recording Button', false, 'Recording button is disabled');
        return false;
      }
      
      // Click the button (we won't actually record, just test the interaction)
      await recordingButton.click();
      await this.page.waitForTimeout(1000);
      
      // Check if button state changed
      const buttonText = await recordingButton.evaluate(el => el.textContent);
      if (buttonText.includes('Stop') || buttonText.includes('Recording')) {
        await this.recordTestResult('Voice Recording Button', true);
        return true;
      } else {
        await this.recordTestResult('Voice Recording Button', false, 'Button state did not change');
        return false;
      }
    } catch (error) {
      await this.recordTestResult('Voice Recording Button', false, error.message);
      return false;
    }
  }

  async testAIFormattingButtons() {
    try {
      console.log('✨ Testing AI formatting buttons...');
      
      // Find AI format buttons
      const formatButtons = await this.page.$$('button:has-text("AI Format")');
      const wordForWordButtons = await this.page.$$('button:has-text("Format Word-for-Word")');
      
      if (formatButtons.length === 0 && wordForWordButtons.length === 0) {
        await this.recordTestResult('AI Formatting Buttons', false, 'No formatting buttons found');
        return false;
      }
      
      // Test main narrative AI format button
      if (formatButtons.length > 0) {
        const mainFormatButton = formatButtons[0];
        const isDisabled = await mainFormatButton.evaluate(el => el.disabled);
        
        if (!isDisabled) {
          await this.recordTestResult('AI Formatting Buttons', true);
          return true;
        } else {
          await this.recordTestResult('AI Formatting Buttons', false, 'Format button is disabled');
          return false;
        }
      }
      
      await this.recordTestResult('AI Formatting Buttons', true);
      return true;
    } catch (error) {
      await this.recordTestResult('AI Formatting Buttons', false, error.message);
      return false;
    }
  }

  async testCompileDocumentButton() {
    try {
      console.log('📄 Testing compile document button...');
      
      // Find the compile document button
      const compileButton = await this.page.$('button:has-text("Compile Final Document")');
      
      if (!compileButton) {
        await this.recordTestResult('Compile Document Button', false, 'Compile button not found');
        return false;
      }
      
      // Check if button is enabled (should be enabled since we have content)
      const isDisabled = await compileButton.evaluate(el => el.disabled);
      if (isDisabled) {
        await this.recordTestResult('Compile Document Button', false, 'Compile button is disabled');
        return false;
      }
      
      await this.recordTestResult('Compile Document Button', true);
      return true;
    } catch (error) {
      await this.recordTestResult('Compile Document Button', false, error.message);
      return false;
    }
  }

  async testFormSections() {
    try {
      console.log('📊 Testing form sections...');
      
      // Check if all major sections are present
      const sections = [
        'Main Narrative',
        'Radiology Report', 
        'Voice Transcript'
      ];
      
      let sectionsFound = 0;
      
      for (const section of sections) {
        const sectionElement = await this.page.$(`h3:has-text("${section}")`) ||
                              await this.page.$(`[class*="${section.toLowerCase().replace(' ', '')}"]`);
        
        if (sectionElement) {
          sectionsFound++;
        }
      }
      
      if (sectionsFound >= 2) { // At least 2 out of 3 sections should be present
        await this.recordTestResult('Form Sections', true);
        return true;
      } else {
        await this.recordTestResult('Form Sections', false, `Only ${sectionsFound} sections found`);
        return false;
      }
    } catch (error) {
      await this.recordTestResult('Form Sections', false, error.message);
      return false;
    }
  }

  async testResponsiveDesign() {
    try {
      console.log('📱 Testing responsive design...');
      
      // Test different viewport sizes
      const viewports = [
        { width: 1920, height: 1080 }, // Desktop
        { width: 1024, height: 768 },  // Tablet
        { width: 768, height: 1024 },  // Mobile landscape
        { width: 375, height: 667 }    // Mobile portrait
      ];
      
      let responsiveTests = 0;
      
      for (const viewport of viewports) {
        await this.page.setViewport(viewport);
        await this.page.waitForTimeout(500);
        
        // Check if main elements are still visible
        const textarea = await this.page.$('textarea');
        const buttons = await this.page.$$('button');
        
        if (textarea && buttons.length > 0) {
          responsiveTests++;
        }
      }
      
      // Reset to original viewport
      await this.page.setViewport(TEST_CONFIG.viewport);
      
      if (responsiveTests >= 3) { // At least 3 out of 4 viewports should work
        await this.recordTestResult('Responsive Design', true);
        return true;
      } else {
        await this.recordTestResult('Responsive Design', false, `${responsiveTests}/4 viewports working`);
        return false;
      }
    } catch (error) {
      await this.recordTestResult('Responsive Design', false, error.message);
      return false;
    }
  }

  async testDataPersistence() {
    try {
      console.log('💾 Testing data persistence...');
      
      // Wait a bit for auto-save
      await this.page.waitForTimeout(3000);
      
      // Refresh the page
      await this.page.reload();
      await this.page.waitForSelector('h1', { timeout: 10000 });
      
      // Check if data is still there
      const textarea = await this.page.$('textarea[placeholder*="main physical examination"]');
      if (textarea) {
        const content = await textarea.evaluate(el => el.value);
        if (content.includes('Examen physique complet')) {
          await this.recordTestResult('Data Persistence', true);
          return true;
        }
      }
      
      await this.recordTestResult('Data Persistence', false, 'Data not persisted after refresh');
      return false;
    } catch (error) {
      await this.recordTestResult('Data Persistence', false, error.message);
      return false;
    }
  }

  async runAllTests() {
    console.log('🧪 Starting Section 7 Comprehensive Test Suite...\n');
    
    const tests = [
      this.navigateToSection7.bind(this),
      this.testFormLoading.bind(this),
      this.testMainNarrativeInput.bind(this),
      this.testRadiologyReportInput.bind(this),
      this.testVoiceTranscriptInput.bind(this),
      this.testVoiceRecordingButton.bind(this),
      this.testAIFormattingButtons.bind(this),
      this.testCompileDocumentButton.bind(this),
      this.testFormSections.bind(this),
      this.testResponsiveDesign.bind(this),
      this.testDataPersistence.bind(this)
    ];
    
    for (const test of tests) {
      try {
        await test();
        await this.page.waitForTimeout(1000); // Brief pause between tests
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
        timestamp: new Date().toISOString()
      },
      results: this.testResults,
      recommendations: this.generateRecommendations()
    };
    
    // Save report to file
    const reportPath = path.join(__dirname, 'section7-test-report.json');
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
    
    if (this.testResults.filter(r => r.test.includes('Voice')).some(r => !r.success)) {
      recommendations.push('Verify voice recording functionality and browser permissions');
    }
    
    if (this.testResults.filter(r => r.test.includes('AI')).some(r => !r.success)) {
      recommendations.push('Check AI formatting API endpoints and authentication');
    }
    
    if (this.testResults.filter(r => r.test.includes('Persistence')).some(r => !r.success)) {
      recommendations.push('Verify form session management and auto-save functionality');
    }
    
    return recommendations;
  }

  async cleanup() {
    if (this.browser) {
      await this.browser.close();
    }
  }
}

// Main execution
async function main() {
  const tester = new Section7Tester();
  
  try {
    const initialized = await tester.initialize();
    if (!initialized) {
      console.error('Failed to initialize tester');
      process.exit(1);
    }
    
    await tester.runAllTests();
    await tester.generateReport();
    
  } catch (error) {
    console.error('Test execution failed:', error);
  } finally {
    await tester.cleanup();
  }
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { Section7Tester, TEST_DATA };
