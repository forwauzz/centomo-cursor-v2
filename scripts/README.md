# Section 7 Test Scripts

This directory contains automated test scripts for testing Section 7 (Physical Examination) functionality in CentomoMD V2.

## Overview

The test scripts simulate real user interactions with the Section 7 form, including:

- Form navigation and loading
- Text input in all sections (Main Narrative, Radiology Report, Voice Transcript)
- Voice recording functionality
- AI formatting buttons
- Document compilation
- Responsive design testing
- Data persistence verification

## Files

- `test-section7.js` - Main test script using Puppeteer
- `run-section7-test.js` - Test runner with server management
- `section7-test-report.json` - Generated test report (created after running tests)

## Prerequisites

1. Install dependencies:
   ```bash
   npm install
   ```

2. Make sure your environment is configured:
   ```bash
   cp env.example .env.local
   # Edit .env.local with your configuration
   ```

3. Ensure your Supabase database is set up and running

## Usage

### Quick Start

Run the test with the npm script:
```bash
npm run test:section7
```

### Manual Execution

1. Start the development server:
   ```bash
   npm run dev
   ```

2. In another terminal, run the test:
   ```bash
   node scripts/test-section7.js
   ```

### Using the Test Runner

The test runner can automatically start the dev server if needed:

```bash
# Run with interactive browser (default)
node scripts/run-section7-test.js

# Run in headless mode
node scripts/run-section7-test.js --headless

# Run with verbose output
node scripts/run-section7-test.js --verbose

# Run quick test (skips some tests)
node scripts/run-section7-test.js --quick

# Show help
node scripts/run-section7-test.js --help
```

## Test Configuration

The test script uses the following configuration:

```javascript
const TEST_CONFIG = {
  baseUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:5002',
  timeout: 30000,
  headless: false, // Set to true for CI/CD
  slowMo: 100, // Slow down actions for visibility
  viewport: { width: 1920, height: 1080 }
};
```

## Test Data

The script uses realistic French medical data for testing:

- **Main Narrative**: Complete physical examination report in French
- **Radiology Report**: Standard radiology report format
- **Voice Transcript**: Dictated examination transcript
- **Measurements**: Vital signs and physical measurements

## Test Coverage

The test suite covers:

1. **Navigation** - Accessing Section 7 page
2. **Form Loading** - All form elements load correctly
3. **Text Input** - All text areas accept input
4. **Voice Recording** - Recording button functionality
5. **AI Formatting** - Format buttons are accessible
6. **Document Compilation** - Final document compilation
7. **Form Sections** - All major sections are present
8. **Responsive Design** - Works on different screen sizes
9. **Data Persistence** - Data survives page refresh

## Test Results

After running the tests, a detailed report is generated in `section7-test-report.json` containing:

- Test summary with pass/fail counts
- Success rate percentage
- Individual test results with timestamps
- Recommendations for failed tests
- Total execution time

## Troubleshooting

### Common Issues

1. **Browser not launching**: Make sure you have sufficient system resources
2. **Page not loading**: Check if the dev server is running on port 5002
3. **Authentication errors**: Ensure your Supabase configuration is correct
4. **Voice recording fails**: Check browser permissions for microphone access

### Debug Mode

Run with verbose output to see detailed logs:
```bash
node scripts/run-section7-test.js --verbose
```

### Headless Mode

For CI/CD or when you don't need to see the browser:
```bash
node scripts/run-section7-test.js --headless
```

## Customization

### Adding New Tests

To add new test cases, modify the `runAllTests()` method in `test-section7.js`:

```javascript
async runAllTests() {
  const tests = [
    // ... existing tests
    this.yourNewTest.bind(this)
  ];
  // ... rest of method
}
```

### Modifying Test Data

Update the `TEST_DATA` object in `test-section7.js` to use different test content.

### Changing Test Configuration

Modify the `TEST_CONFIG` object to adjust timeouts, viewport sizes, etc.

## Integration

These tests can be integrated into:

- CI/CD pipelines
- Pre-commit hooks
- Automated testing workflows
- Quality assurance processes

## Support

For issues with the test scripts:

1. Check the generated test report for specific failure details
2. Review the console output for error messages
3. Verify your environment configuration
4. Ensure all dependencies are installed

## Contributing

When adding new features to Section 7, please:

1. Update the test scripts to cover new functionality
2. Add appropriate test data for new features
3. Update this README with any new test options
4. Ensure tests pass before submitting changes
