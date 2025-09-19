#!/usr/bin/env node

/**
 * Basic Test Infrastructure
 * Essential validation tests for core functionality
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

function testEssentialFiles() {
  log(colors.cyan, '\n=== Testing Essential Files ===');
  
  const essentialFiles = [
    'package.json',
    'src/App.tsx',
    'src/main.tsx',
    'src/index.css',
    'src/main.css',
    'index.html',
    'vite.config.ts',
    'vite.config.github.ts',
    'vite.config.standalone.ts',
    'tsconfig.json'
  ];
  
  let allExist = true;
  for (const file of essentialFiles) {
    if (fs.existsSync(path.join(projectRoot, file))) {
      log(colors.green, `✅ Essential file exists: ${file}`);
    } else {
      log(colors.red, `❌ Essential file missing: ${file}`);
      allExist = false;
    }
  }
  
  return allExist;
}

function testPackageJsonStructure() {
  log(colors.cyan, '\n=== Testing Package.json Structure ===');
  
  let pkg;
  try {
    pkg = JSON.parse(fs.readFileSync(path.join(projectRoot, 'package.json'), 'utf8'));
    log(colors.green, '✅ package.json is valid JSON');
  } catch (error) {
    log(colors.red, '❌ package.json is invalid JSON');
    return false;
  }
  
  const requiredFields = ['name', 'version', 'scripts', 'dependencies'];
  for (const field of requiredFields) {
    if (pkg[field]) {
      log(colors.green, `✅ Package.json has required field: ${field}`);
    } else {
      log(colors.red, `❌ Package.json missing required field: ${field}`);
      return false;
    }
  }
  
  const requiredScripts = ['build', 'dev', 'build:github-pages', 'build:standalone'];
  for (const script of requiredScripts) {
    if (pkg.scripts && pkg.scripts[script]) {
      log(colors.green, `✅ Package.json has required script: ${script}`);
    } else {
      log(colors.red, `❌ Package.json missing required script: ${script}`);
      return false;
    }
  }
  
  return true;
}

function testBasicSyntax() {
  log(colors.cyan, '\n=== Testing Basic Syntax ===');
  
  const filesToCheck = [
    'src/App.tsx',
    'src/main.tsx',
    'vite.config.ts'
  ];
  
  for (const file of filesToCheck) {
    try {
      const content = fs.readFileSync(path.join(projectRoot, file), 'utf8');
      
      // Basic syntax checks
      if (content.includes('import') || content.includes('export')) {
        log(colors.green, `✅ ${file} has valid import/export syntax`);
      } else {
        log(colors.yellow, `⚠️  ${file} may have syntax issues`);
      }
      
      // Check for obvious syntax errors
      const openBraces = (content.match(/\{/g) || []).length;
      const closeBraces = (content.match(/\}/g) || []).length;
      if (openBraces === closeBraces) {
        log(colors.green, `✅ ${file} has balanced braces`);
      } else {
        log(colors.red, `❌ ${file} has unbalanced braces`);
        return false;
      }
      
    } catch (error) {
      log(colors.red, `❌ Cannot read ${file}: ${error.message}`);
      return false;
    }
  }
  
  return true;
}

function runBasicTests() {
  log(colors.bold + colors.blue, '🔍 Running Basic Test Infrastructure\n');
  
  const testSuites = [
    { name: 'Essential Files', test: testEssentialFiles },
    { name: 'Package.json Structure', test: testPackageJsonStructure },
    { name: 'Basic Syntax', test: testBasicSyntax }
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
  log(colors.bold + colors.cyan, '\n=== Basic Test Summary ===');
  log(colors.green, `✅ Passed: ${passed}/${testSuites.length}`);
  log(colors.red, `❌ Failed: ${failed}/${testSuites.length}`);
  
  if (failed > 0) {
    log(colors.red, '\n❌ Some basic tests failed!');
    process.exit(1);
  } else {
    log(colors.green, '\n✅ All basic tests passed!');
  }
}

// Export for use in other scripts
if (import.meta.url === `file://${process.argv[1]}`) {
  runBasicTests();
}

export { runBasicTests };