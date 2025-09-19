#!/usr/bin/env node

/**
 * UI-specific tests for responsiveness and layout
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
  cyan: '\x1b[36m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(color, message) {
  console.log(`${color}${message}${colors.reset}`);
}

function testUIStructure() {
  log(colors.cyan, '\n=== Testing UI Structure ===');
  
  const uiFiles = [
    'src/components/ui/button.tsx',
    'src/components/ui/input.tsx', 
    'src/components/ui/dialog.tsx',
    'src/components/ui/tabs.tsx',
    'src/components/ui/select.tsx'
  ];
  
  let allExist = true;
  
  for (const file of uiFiles) {
    if (fs.existsSync(path.join(projectRoot, file))) {
      log(colors.green, `✅ UI component exists: ${file}`);
    } else {
      log(colors.red, `❌ UI component missing: ${file}`);
      allExist = false;
    }
  }
  
  return allExist;
}

function testResponsiveStyles() {
  log(colors.cyan, '\n=== Testing Responsive Styles ===');
  
  const indexCSS = fs.readFileSync(path.join(projectRoot, 'src/index.css'), 'utf8');
  
  const responsivePatterns = [
    'messaging-app-container',
    'sidebar-container', 
    'main-content-area',
    'chat-container',
    '@media (max-width: 640px)',
    '@media (min-width: 641px)'
  ];
  
  let allFound = true;
  
  for (const pattern of responsivePatterns) {
    if (indexCSS.includes(pattern)) {
      log(colors.green, `✅ Responsive pattern found: ${pattern}`);
    } else {
      log(colors.red, `❌ Responsive pattern missing: ${pattern}`);
      allFound = false;
    }
  }
  
  return allFound;
}

function runUITests() {
  log(colors.bold + colors.blue, '🎨 Running UI Tests\n');
  
  const tests = [
    { name: 'UI Structure', test: testUIStructure },
    { name: 'Responsive Styles', test: testResponsiveStyles }
  ];
  
  let passed = 0;
  let failed = 0;
  
  for (const test of tests) {
    if (test.test()) {
      passed++;
    } else {
      failed++;
    }
  }
  
  log(colors.bold + colors.cyan, '\n=== UI Test Summary ===');
  log(colors.green, `✅ Passed: ${passed}/${tests.length}`);
  log(colors.red, `❌ Failed: ${failed}/${tests.length}`);
  
  return failed === 0;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  runUITests();
}

export { runUITests, testUIStructure, testResponsiveStyles };