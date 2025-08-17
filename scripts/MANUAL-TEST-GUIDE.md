# Section 7 Manual Test Guide

This guide provides step-by-step instructions for manually testing Section 7 (Physical Examination) functionality in CentomoMD V2.

## Prerequisites

1. **Development Server Running**
   ```bash
   npm run dev
   ```
   - Verify the server is running on http://localhost:5002
   - You should see the Next.js development server output

2. **Environment Configuration**
   - Ensure your `.env.local` file is properly configured
   - Check that Supabase credentials are set

## Test Scenarios

### Test Scenario 1: Basic Page Access

**Objective**: Verify that Section 7 page loads correctly

**Steps**:
1. Open your browser and navigate to `http://localhost:5002/form/section7`
2. **Expected Result**: Page should load with the title "Section 7: Physical Examination"
3. **Check for**:
   - Page title is visible
   - No JavaScript errors in browser console
   - Page loads within 3 seconds

**Pass/Fail Criteria**:
- ✅ **PASS**: Page loads successfully with correct title
- ❌ **FAIL**: Page doesn't load, shows error, or takes too long

---

### Test Scenario 2: Form Elements Loading

**Objective**: Verify all form elements are present and functional

**Steps**:
1. Navigate to Section 7 page
2. **Check for these elements**:
   - Main Narrative textarea (large text area)
   - Radiology Report textarea
   - Voice Transcript textarea
   - "Start Recording" button
   - "AI Format" button
   - "Compile Final Document" button

**Expected Results**:
- All textareas should be visible and editable
- Buttons should be present (may be disabled initially)

**Pass/Fail Criteria**:
- ✅ **PASS**: All expected elements are present
- ❌ **FAIL**: Missing elements or elements not functional

---

### Test Scenario 3: Text Input Functionality

**Objective**: Test that users can enter text in all sections

**Test Data**:
```text
Main Narrative:
Examen physique complet effectué le [DATE].

SIGNES VITAUX:
- Tension artérielle: 120/80 mmHg
- Pouls: 72 bpm, régulier
- Température: 36.8°C
- Saturation en oxygène: 98%

EXAMEN PHYSIQUE GÉNÉRAL:
Le patient se présente en bon état général, conscient et orienté.

Radiology Report:
RAPPORT RADIOLOGIQUE

EXAMEN: Radiographie thoracique PA et latérale
DATE: [DATE]
INDICATION: Bilan préventif

CONCLUSION:
Radiographie thoracique normale sans anomalie détectée.

Voice Transcript:
Transcription de l'examen physique dicté:

Le patient présente un bon état général. L'examen des signes vitaux révèle une tension artérielle de 120 sur 80, un pouls régulier à 72 battements par minute, une température de 36,8 degrés Celsius et une saturation en oxygène de 98 pour cent.
```

**Steps**:
1. Click in the Main Narrative textarea
2. Type or paste the test data for Main Narrative
3. Click in the Radiology Report textarea
4. Type or paste the test data for Radiology Report
5. Click in the Voice Transcript textarea
6. Type or paste the test data for Voice Transcript

**Expected Results**:
- Text should appear as you type
- No lag or freezing during typing
- Text should persist when clicking between fields

**Pass/Fail Criteria**:
- ✅ **PASS**: All text areas accept input and display text correctly
- ❌ **FAIL**: Text areas don't work, text disappears, or typing is slow

---

### Test Scenario 4: Voice Recording Button

**Objective**: Test voice recording button functionality

**Steps**:
1. Ensure you have a microphone connected and permissions granted
2. Click the "Start Recording" button
3. **Expected Result**: Button should change to "Stop Recording" with a red indicator
4. Speak a few words (e.g., "Test recording for Section 7")
5. Click "Stop Recording"

**Expected Results**:
- Button state changes appropriately
- Recording indicator appears
- No JavaScript errors in console

**Pass/Fail Criteria**:
- ✅ **PASS**: Button responds to clicks and changes state
- ❌ **FAIL**: Button doesn't respond or causes errors

---

### Test Scenario 5: AI Formatting Buttons

**Objective**: Test AI formatting functionality

**Steps**:
1. Ensure you have text in the Main Narrative field
2. Click the "AI Format" button
3. **Expected Result**: Button should show loading state briefly
4. Check if text gets formatted (may require authentication)

**Expected Results**:
- Button responds to clicks
- Loading state appears
- No JavaScript errors

**Pass/Fail Criteria**:
- ✅ **PASS**: Button responds and shows loading state
- ❌ **FAIL**: Button doesn't respond or causes errors

---

### Test Scenario 6: Document Compilation

**Objective**: Test the final document compilation feature

**Steps**:
1. Ensure you have content in at least one text area
2. Click the "Compile Final Document" button
3. **Expected Result**: Button should show loading state
4. Check if document gets compiled (may be copied to clipboard)

**Expected Results**:
- Button responds to clicks
- Loading state appears
- No JavaScript errors

**Pass/Fail Criteria**:
- ✅ **PASS**: Button responds and shows loading state
- ❌ **FAIL**: Button doesn't respond or causes errors

---

### Test Scenario 7: Data Persistence

**Objective**: Test that data persists when navigating away and back

**Steps**:
1. Enter some test data in the text areas
2. Wait 30 seconds (for auto-save)
3. Refresh the page (F5 or Ctrl+R)
4. **Expected Result**: Data should still be present

**Expected Results**:
- Data persists after page refresh
- No data loss

**Pass/Fail Criteria**:
- ✅ **PASS**: Data persists after refresh
- ❌ **FAIL**: Data is lost after refresh

---

### Test Scenario 8: Responsive Design

**Objective**: Test that the form works on different screen sizes

**Steps**:
1. Open browser developer tools (F12)
2. Toggle device toolbar (mobile view)
3. Test different device sizes:
   - iPhone SE (375x667)
   - iPad (768x1024)
   - Desktop (1920x1080)

**Expected Results**:
- Form should be usable on all screen sizes
- Text areas should be readable
- Buttons should be clickable

**Pass/Fail Criteria**:
- ✅ **PASS**: Form is usable on all tested screen sizes
- ❌ **FAIL**: Form is unusable on some screen sizes

---

### Test Scenario 9: Error Handling

**Objective**: Test how the application handles errors

**Steps**:
1. Open browser developer tools (F12)
2. Go to Console tab
3. Navigate to Section 7 page
4. Perform various actions (typing, clicking buttons)
5. **Expected Result**: No red error messages in console

**Expected Results**:
- No JavaScript errors in console
- Application continues to function normally

**Pass/Fail Criteria**:
- ✅ **PASS**: No errors in console
- ❌ **FAIL**: Errors appear in console

---

### Test Scenario 10: Performance

**Objective**: Test application performance

**Steps**:
1. Open browser developer tools (F12)
2. Go to Network tab
3. Refresh the Section 7 page
4. **Expected Result**: Page should load quickly

**Expected Results**:
- Page loads within 3 seconds
- No long-running requests

**Pass/Fail Criteria**:
- ✅ **PASS**: Page loads quickly
- ❌ **FAIL**: Page takes too long to load

---

## Test Report Template

Use this template to record your test results:

```markdown
# Section 7 Test Report

**Date**: [DATE]
**Tester**: [YOUR NAME]
**Environment**: [BROWSER + VERSION]

## Test Results

| Test Scenario | Status | Notes |
|---------------|--------|-------|
| Basic Page Access | ✅ PASS / ❌ FAIL | |
| Form Elements Loading | ✅ PASS / ❌ FAIL | |
| Text Input Functionality | ✅ PASS / ❌ FAIL | |
| Voice Recording Button | ✅ PASS / ❌ FAIL | |
| AI Formatting Buttons | ✅ PASS / ❌ FAIL | |
| Document Compilation | ✅ PASS / ❌ FAIL | |
| Data Persistence | ✅ PASS / ❌ FAIL | |
| Responsive Design | ✅ PASS / ❌ FAIL | |
| Error Handling | ✅ PASS / ❌ FAIL | |
| Performance | ✅ PASS / ❌ FAIL | |

## Summary

**Total Tests**: 10
**Passed**: [X]
**Failed**: [Y]
**Success Rate**: [X]%

## Issues Found

[List any issues discovered during testing]

## Recommendations

[List any recommendations for improvements]
```

## Quick Test Commands

You can also run these automated tests:

```bash
# Basic test (recommended)
npm run test:section7

# Simple test
npm run test:section7:simple

# Full test (requires Puppeteer)
npm run test:section7:full
```

## Troubleshooting

### Common Issues

1. **Page doesn't load**
   - Check if development server is running
   - Verify port 5002 is not blocked
   - Check browser console for errors

2. **Voice recording doesn't work**
   - Ensure microphone permissions are granted
   - Check if microphone is connected and working
   - Try refreshing the page

3. **AI formatting doesn't work**
   - Check if you're authenticated
   - Verify environment variables are set
   - Check browser console for API errors

4. **Data doesn't persist**
   - Wait longer for auto-save (30 seconds)
   - Check if you're authenticated
   - Verify database connection

### Getting Help

If you encounter issues:
1. Check the browser console for error messages
2. Verify your environment configuration
3. Check the application logs
4. Review the troubleshooting section above
