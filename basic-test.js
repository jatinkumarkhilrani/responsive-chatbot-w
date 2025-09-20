// Simple Build Test for GitHub Pages
// Tests the most critical build issues

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

// Colors for output
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
};

function log(color, message) {
  console.log(`${color}${message}${colors.reset}`);
}

function checkFileExists(filePath, name) {
  if (fs.existsSync(path.join(projectRoot, filePath))) {
    log(colors.green, `✅ ${name} exists`);
    return true;
  } else {
    log(colors.red, `❌ ${name} missing`);
    return false;
  }
}

function runBasicTests() {
  log(colors.blue, '🧪 Running Basic Build Tests\n');
  
  let passed = 0;
  let total = 0;
  
  // Test 1: Critical files exist
  const criticalFiles = [
    ['src/App.tsx', 'App component'],
    ['src/main.tsx', 'Main entry point'],
    ['src/index.css', 'Index styles'],
    ['src/main.css', 'Main styles'],
    ['index.html', 'HTML entry'],
    ['package.json', 'Package config'],
    ['vite.config.github.ts', 'GitHub Vite config'],
    ['vite.config.standalone.ts', 'Standalone Vite config']
  ];
  
  log(colors.blue, '=== File Structure Tests ===');
  for (const [file, name] of criticalFiles) {
    total++;
    if (checkFileExists(file, name)) {
      passed++;
    }
  }
  
  // Test 2: Check for React 19 compatibility
  log(colors.blue, '\n=== React 19 Compatibility ===');
  total++;
  const appContent = fs.readFileSync(path.join(projectRoot, 'src/App.tsx'), 'utf8');
  if (!appContent.includes('import React,')) {
    log(colors.green, '✅ React 19 compatible imports');
    passed++;
  } else {
    log(colors.red, '❌ React 19 incompatible imports found');
  }
  
  // Test 3: Check package.json scripts
  log(colors.blue, '\n=== Package Scripts ===');
  const pkg = JSON.parse(fs.readFileSync(path.join(projectRoot, 'package.json'), 'utf8'));
  const requiredScripts = [
    'build:github-pages',
    'build:standalone',
    'test:types'
  ];
  
  for (const script of requiredScripts) {
    total++;
    if (pkg.scripts && pkg.scripts[script]) {
      log(colors.green, `✅ Script: ${script}`);
      passed++;
    } else {
      log(colors.red, `❌ Missing script: ${script}`);
    }
  }
  
  // Test 4: Check CSS structure
  log(colors.blue, '\n=== CSS Structure ===');
  total++;
  const mainCSS = fs.readFileSync(path.join(projectRoot, 'src/main.css'), 'utf8');
  if (mainCSS.includes('@theme inline') && mainCSS.includes('--spacing-')) {
    log(colors.green, '✅ Main CSS has proper theme structure');
    passed++;
  } else {
    log(colors.red, '❌ Main CSS missing theme structure');
  }
  
  // Test 5: Check for problematic chart component
  log(colors.blue, '\n=== Component Structure ===');
  total++;
  if (checkFileExists('src/components/ui/chart.tsx', 'Chart component')) {
    passed++;
  }
  
  // Summary
  log(colors.blue, '\n=== Test Summary ===');
  log(colors.green, `✅ Passed: ${passed}/${total}`);
  if (passed < total) {
    log(colors.red, `❌ Failed: ${total - passed}/${total}`);
    log(colors.yellow, '\n⚠️  Some basic tests failed. Fix these before building.');
    process.exit(1);
  } else {
    log(colors.green, '\n🎉 All basic tests passed! Ready to build.');
  }
}

runBasicTests();