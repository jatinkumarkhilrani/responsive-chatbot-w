#!/usr/bin/env node

/**
 * Simple build test to verify all fixes work correctly
 */

import { execSync } from 'child_process';
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

function runCommand(command, options = {}) {
  try {
    const result = execSync(command, { 
      cwd: projectRoot,
      encoding: 'utf8',
      stdio: 'pipe',
      timeout: 60000, // 60 second timeout
      ...options
    });
    return { success: true, output: result };
  } catch (error) {
    return { 
      success: false, 
      error: error.message,
      output: error.stdout || '',
      stderr: error.stderr || ''
    };
  }
}

// Test 1: Check if dependencies are properly installed
function testDependencies() {
  log(colors.blue, '🔍 Testing Dependencies...');
  
  // Check if node_modules exists
  if (!fs.existsSync(path.join(projectRoot, 'node_modules'))) {
    log(colors.red, '❌ node_modules not found');
    return false;
  }
  
  // Check for critical packages
  const criticalPackages = [
    '@github/spark',
    'react',
    'react-dom',
    'vite',
    'typescript'
  ];
  
  for (const pkg of criticalPackages) {
    const pkgPath = path.join(projectRoot, 'node_modules', pkg);
    if (!fs.existsSync(pkgPath)) {
      log(colors.red, `❌ Missing package: ${pkg}`);
      return false;
    }
    log(colors.green, `✅ Found package: ${pkg}`);
  }
  
  return true;
}

// Test 2: TypeScript type checking
function testTypeScript() {
  log(colors.blue, '🔍 Testing TypeScript...');
  
  const typeCheck = runCommand('npx tsc --noEmit');
  if (!typeCheck.success) {
    log(colors.red, '❌ TypeScript errors found');
    log(colors.white, typeCheck.stderr.slice(0, 500) + '...');
    return false;
  }
  
  log(colors.green, '✅ TypeScript types valid');
  return true;
}

// Test 3: Build process
function testBuild() {
  log(colors.blue, '🔨 Testing Build Process...');
  
  // Clean any existing dist
  const distPath = path.join(projectRoot, 'dist');
  if (fs.existsSync(distPath)) {
    fs.rmSync(distPath, { recursive: true, force: true });
  }
  
  // Test standalone build
  const standaloneBuild = runCommand('npx vite build --config vite.config.standalone.ts');
  if (!standaloneBuild.success) {
    log(colors.red, '❌ Standalone build failed');
    log(colors.white, standaloneBuild.stderr.slice(0, 500));
    return false;
  }
  
  log(colors.green, '✅ Standalone build successful');
  
  // Check if dist was created
  if (!fs.existsSync(distPath)) {
    log(colors.red, '❌ No dist folder created');
    return false;
  }
  
  log(colors.green, '✅ Build artifacts created');
  return true;
}

// Test 4: Critical files structure
function testFileStructure() {
  log(colors.blue, '🔍 Testing File Structure...');
  
  const criticalFiles = [
    'src/App.tsx',
    'src/main.tsx',
    'src/index.css',
    'src/main.css',
    'index.html',
    'vite.config.ts',
    'vite.config.github.ts',
    'vite.config.standalone.ts',
    'package.json',
    'tsconfig.json'
  ];
  
  for (const file of criticalFiles) {
    if (!fs.existsSync(path.join(projectRoot, file))) {
      log(colors.red, `❌ Missing critical file: ${file}`);
      return false;
    }
    log(colors.green, `✅ Found file: ${file}`);
  }
  
  return true;
}

// Main test runner
function runTests() {
  log(colors.bold + colors.blue, '🚀 Running Build Tests\n');
  
  const tests = [
    { name: 'Dependencies', test: testDependencies },
    { name: 'File Structure', test: testFileStructure },
    { name: 'TypeScript', test: testTypeScript },
    { name: 'Build Process', test: testBuild }
  ];
  
  let passed = 0;
  let failed = 0;
  
  for (const { name, test } of tests) {
    try {
      log(colors.cyan, `\n=== Testing ${name} ===`);
      if (test()) {
        passed++;
        log(colors.green, `✅ ${name} test passed`);
      } else {
        failed++;
        log(colors.red, `❌ ${name} test failed`);
      }
    } catch (error) {
      log(colors.red, `❌ ${name} test crashed: ${error.message}`);
      failed++;
    }
  }
  
  // Summary
  log(colors.bold + colors.cyan, '\n=== Test Summary ===');
  log(colors.green, `✅ Passed: ${passed}/${tests.length}`);
  log(colors.red, `❌ Failed: ${failed}/${tests.length}`);
  
  if (failed > 0) {
    log(colors.red, '\n❌ Some tests failed! Check the issues above.');
    process.exit(1);
  } else {
    log(colors.green, '\n✅ All tests passed! Build system is working correctly.');
  }
}

// Export for use in other scripts
if (import.meta.url === `file://${process.argv[1]}`) {
  runTests();
}

export { runTests };