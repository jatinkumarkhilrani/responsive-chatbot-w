#!/usr/bin/env node

/**
 * UI Test Infrastructure
 * Tests for responsiveness, layout issues, and component integrity
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

// ANSI colors
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(color, message) {
  console.log(`${color}${message}${colors.reset}`);
}

function testUIComponents() {
  log(colors.cyan, '\n=== Testing UI Components ===');
  
  const requiredComponents = [
    'src/components/ui/button.tsx',
    'src/components/ui/input.tsx',
    'src/components/ui/dialog.tsx',
    'src/components/ui/tabs.tsx',
    'src/components/ui/select.tsx',
    'src/components/ui/card.tsx',
    'src/components/ui/scroll-area.tsx'
  ];
  
  let allExist = true;
  for (const component of requiredComponents) {
    if (fs.existsSync(path.join(projectRoot, component))) {
      log(colors.green, `✅ Component exists: ${component}`);
    } else {
      log(colors.red, `❌ Component missing: ${component}`);
      allExist = false;
    }
  }
  
  return allExist;
}

function testResponsiveCSS() {
  log(colors.cyan, '\n=== Testing Responsive CSS ===');
  
  const indexCSS = fs.readFileSync(path.join(projectRoot, 'src/index.css'), 'utf8');
  
  const responsivePatterns = [
    '.messaging-app-container',
    '.sidebar-container',
    '.main-content-area',
    '.chat-container',
    '@media (max-width: 640px)',
    '@media (min-width: 641px)',
    'height: 100vh',
    'height: 100dvh'
  ];
  
  let allPatternsFound = true;
  for (const pattern of responsivePatterns) {
    if (indexCSS.includes(pattern)) {
      log(colors.green, `✅ CSS pattern found: ${pattern}`);
    } else {
      log(colors.yellow, `⚠️  CSS pattern missing: ${pattern}`);
      allPatternsFound = false;
    }
  }
  
  return allPatternsFound;
}

function testMainComponents() {
  log(colors.cyan, '\n=== Testing Main Components ===');
  
  const mainComponents = [
    'src/components/MessagingApp.tsx',
    'src/components/ChatList.tsx',
    'src/components/MessageList.tsx',
    'src/components/SettingsDialog.tsx'
  ];
  
  let allExist = true;
  for (const component of mainComponents) {
    if (fs.existsSync(path.join(projectRoot, component))) {
      log(colors.green, `✅ Main component exists: ${component}`);
    } else {
      log(colors.red, `❌ Main component missing: ${component}`);
      allExist = false;
    }
  }
  
  return allExist;
}

function runUITests() {
  log(colors.bold + colors.blue, '🎨 Running UI Test Infrastructure\n');
  
  const testSuites = [
    { name: 'UI Components', test: testUIComponents },
    { name: 'Responsive CSS', test: testResponsiveCSS },
    { name: 'Main Components', test: testMainComponents }
  ];
  
  let passed = 0;
  let failed = 0;
  
  for (const suite of testSuites) {
    try {
      if (suite.test()) {
        passed++;
      } else {
        failed++;
      }
    } catch (error) {
      log(colors.red, `❌ Test suite "${suite.name}" crashed: ${error.message}`);
      failed++;
    }
  }
  
  // Summary
  log(colors.bold + colors.cyan, '\n=== UI Test Summary ===');
  log(colors.green, `✅ Passed: ${passed}/${testSuites.length}`);
  log(colors.red, `❌ Failed: ${failed}/${testSuites.length}`);
  
  if (failed > 0) {
    log(colors.red, '\n❌ Some UI tests failed!');
    process.exit(1);
  } else {
    log(colors.green, '\n✅ All UI tests passed!');
  }
}

// Export for use in other scripts
if (import.meta.url === `file://${process.argv[1]}`) {
  runUITests();
}

export { runUITests };