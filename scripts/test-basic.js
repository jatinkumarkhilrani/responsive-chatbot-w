#!/usr/bin/env node

/**
 * Simple test runner that doesn't rely on internal commands
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

function testFileStructure() {
  log(colors.cyan, '\n=== Testing File Structure ===');
  
  const requiredFiles = [
    'package.json',
    'vite.config.ts',
    'vite.config.github.ts', 
    'vite.config.standalone.ts',
    'src/App.tsx',
    'src/main.tsx',
    'src/index.css',
    'src/main.css',
    'index.html'
  ];
  
  let allExist = true;
  
  for (const file of requiredFiles) {
    if (fs.existsSync(path.join(projectRoot, file))) {
      log(colors.green, `✅ Required file exists: ${file}`);
    } else {
      log(colors.red, `❌ Required file missing: ${file}`);
      allExist = false;
    }
  }
  
  return allExist;
}

function testPackageJSON() {
  log(colors.cyan, '\n=== Testing package.json ===');
  
  try {
    const pkg = JSON.parse(fs.readFileSync(path.join(projectRoot, 'package.json'), 'utf8'));
    
    const requiredScripts = [
      'build:github-pages',
      'build:standalone', 
      'test:comprehensive',
      'test:ui',
      'test:performance'
    ];
    
    let allScriptsExist = true;
    
    for (const script of requiredScripts) {
      if (pkg.scripts && pkg.scripts[script]) {
        log(colors.green, `✅ Script exists: ${script}`);
      } else {
        log(colors.red, `❌ Missing script: ${script}`);
        allScriptsExist = false;
      }
    }
    
    return allScriptsExist;
  } catch (error) {
    log(colors.red, '❌ Invalid package.json');
    return false;
  }
}

function testCSS() {
  log(colors.cyan, '\n=== Testing CSS Configuration ===');
  
  const mainCSS = fs.readFileSync(path.join(projectRoot, 'src/main.css'), 'utf8');
  const indexCSS = fs.readFileSync(path.join(projectRoot, 'src/index.css'), 'utf8');
  
  // Check for spacing system that prevents Tailwind errors
  if (mainCSS.includes('--spacing-') && mainCSS.includes('@theme inline')) {
    log(colors.green, '✅ Spacing system configured in main.css');
  } else {
    log(colors.red, '❌ Spacing system missing - this causes Tailwind build errors');
    return false;
  }
  
  // Check for responsive styles
  const responsivePatterns = [
    'messaging-app-container',
    'sidebar-container',
    'main-content-area',
    '@media (max-width: 640px)',
    '@media (min-width: 641px)'
  ];
  
  let responsiveOk = true;
  for (const pattern of responsivePatterns) {
    if (indexCSS.includes(pattern)) {
      log(colors.green, `✅ Responsive pattern found: ${pattern}`);
    } else {
      log(colors.yellow, `⚠️  Responsive pattern missing: ${pattern}`);
      responsiveOk = false;
    }
  }
  
  return responsiveOk;
}

function testGitHubPagesConfig() {
  log(colors.cyan, '\n=== Testing GitHub Pages Configuration ===');
  
  // Check vite.config.github.ts
  const viteGithubConfig = fs.readFileSync(path.join(projectRoot, 'vite.config.github.ts'), 'utf8');
  
  if (viteGithubConfig.includes("base: '/responsive-chatbot-w/'")) {
    log(colors.green, '✅ GitHub Pages base path configured');
  } else {
    log(colors.red, '❌ GitHub Pages base path missing');
    return false;
  }
  
  // Check index.html
  const indexHTML = fs.readFileSync(path.join(projectRoot, 'index.html'), 'utf8');
  
  if (indexHTML.includes('window.GITHUB_PAGES_BASE')) {
    log(colors.green, '✅ GitHub Pages routing configured');
  } else {
    log(colors.yellow, '⚠️  GitHub Pages routing may be missing');
  }
  
  return true;
}

function runBasicTests() {
  log(colors.bold + colors.blue, '🧪 Running Basic Test Infrastructure\n');
  
  const tests = [
    { name: 'File Structure', test: testFileStructure },
    { name: 'Package JSON', test: testPackageJSON },
    { name: 'CSS Configuration', test: testCSS },
    { name: 'GitHub Pages Config', test: testGitHubPagesConfig }
  ];
  
  let passed = 0;
  let failed = 0;
  
  for (const test of tests) {
    try {
      if (test.test()) {
        passed++;
      } else {
        failed++;
      }
    } catch (error) {
      log(colors.red, `❌ Test "${test.name}" crashed: ${error.message}`);
      failed++;
    }
  }
  
  log(colors.bold + colors.cyan, '\n=== Test Summary ===');
  log(colors.green, `✅ Passed: ${passed}/${tests.length}`);
  log(colors.red, `❌ Failed: ${failed}/${tests.length}`);
  
  if (failed > 0) {
    log(colors.red, '\n❌ Some tests failed! Please fix issues before deploying.');
    process.exit(1);
  } else {
    log(colors.green, '\n✅ Basic tests passed! Ready for further testing.');
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  runBasicTests();
}

export { runBasicTests };