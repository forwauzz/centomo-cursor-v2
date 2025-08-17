console.log('Hello from Section 7 test!');
console.log('Testing basic functionality...');

// Test data
const testData = {
  mainNarrative: 'Examen physique complet effectué le ' + new Date().toLocaleDateString('fr-CA'),
  radiologyReport: 'RAPPORT RADIOLOGIQUE - Radiographie thoracique normale',
  voiceTranscript: 'Transcription de l\'examen physique dicté'
};

console.log('Test data created:');
console.log('- Main Narrative:', testData.mainNarrative.substring(0, 50) + '...');
console.log('- Radiology Report:', testData.radiologyReport.substring(0, 50) + '...');
console.log('- Voice Transcript:', testData.voiceTranscript.substring(0, 50) + '...');

// Test environment
console.log('\nEnvironment check:');
console.log('- Node version:', process.version);
console.log('- Platform:', process.platform);
console.log('- Current directory:', process.cwd());

// Test HTTP module
try {
  const http = require('http');
  console.log('- HTTP module: Available');
} catch (error) {
  console.log('- HTTP module: Not available');
}

console.log('\n✅ Basic test completed successfully!');
