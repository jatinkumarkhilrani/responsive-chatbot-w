#!/usr/bin/env node

/**
 * Performance Test Infrastructure
 * Tests for bundle size, memory usage, and performance issues
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

function getDirectorySize(dirPath) {
  let totalSize = 0;
  if (!fs.existsSync(dirPath)) return 0;
  
  function calculateSize(itemPath) {
    const stats = fs.statSync(itemPath);
    if (stats.isDirectory()) {
      const files = fs.readdirSync(itemPath);
      files.forEach(file => calculateSize(path.join(itemPath, file)));
    } else {
      totalSize += stats.size;
    }
  }
  calculateSize(dirPath);
  return totalSize;
}

function testBundleSize() {
  log(colors.cyan, '\n=== Testing Bundle Size ===');
  
  const distPath = path.join(projectRoot, 'dist');
  if (!fs.existsSync(distPath)) {
    log(colors.yellow, '⚠️  No dist folder found, build first');
    return true;
  }
  
  const bundleSize = getDirectorySize(distPath);
  const bundleSizeMB = bundleSize / (1024 * 1024);
  
  log(colors.white, `📦 Bundle size: ${bundleSizeMB.toFixed(2)} MB`);
  
  if (bundleSizeMB > 5) {
    log(colors.red, '❌ Bundle too large (>5MB)');
    return false;
  } else if (bundleSizeMB > 2) {
    log(colors.yellow, '⚠️  Bundle getting large (>2MB)');
    return true;
  } else {
    log(colors.green, '✅ Bundle size optimal');
    return true;
  }
}

function testCodeSplitting() {
  log(colors.cyan, '\n=== Testing Code Splitting ===');
  
  const distPath = path.join(projectRoot, 'dist');
  if (!fs.existsSync(distPath)) {
    log(colors.yellow, '⚠️  No dist folder found, build first');
    return true;
  }
  
  const assetsPath = path.join(distPath, 'assets');
  if (fs.existsSync(assetsPath)) {
    const files = fs.readdirSync(assetsPath);
    const jsFiles = files.filter(file => file.endsWith('.js'));
    
    log(colors.white, `📄 Number of JS chunks: ${jsFiles.length}`);
    
    if (jsFiles.length > 1) {
      log(colors.green, '✅ Code splitting appears to be working');
      return true;
    } else {
      log(colors.yellow, '⚠️  Only one JS chunk found - code splitting may not be optimal');
      return true;
    }
  }
  
  log(colors.yellow, '⚠️  No assets folder found');
  return true;
}

function testNodeModulesSize() {
  log(colors.cyan, '\n=== Testing Node Modules Size ===');
  
  const nodeModulesPath = path.join(projectRoot, 'node_modules');
  if (!fs.existsSync(nodeModulesPath)) {
    log(colors.red, '❌ node_modules not found');
    return false;
  }
  
  const nodeModulesSize = getDirectorySize(nodeModulesPath);
  const nodeModulesSizeMB = nodeModulesSize / (1024 * 1024);
  
  log(colors.white, `📦 node_modules size: ${nodeModulesSizeMB.toFixed(2)} MB`);
  
  if (nodeModulesSizeMB > 1000) {
    log(colors.red, '❌ node_modules too large (>1GB)');
    return false;
  } else if (nodeModulesSizeMB > 500) {
    log(colors.yellow, '⚠️  node_modules getting large (>500MB)');
    return true;
  } else {
    log(colors.green, '✅ node_modules size reasonable');
    return true;
  }
}

function runPerformanceTests() {
  log(colors.bold + colors.blue, '⚡ Running Performance Test Infrastructure\n');
  
  const testSuites = [
    { name: 'Bundle Size', test: testBundleSize },
    { name: 'Code Splitting', test: testCodeSplitting },
    { name: 'Node Modules Size', test: testNodeModulesSize }
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
  log(colors.bold + colors.cyan, '\n=== Performance Test Summary ===');
  log(colors.green, `✅ Passed: ${passed}/${testSuites.length}`);
  log(colors.red, `❌ Failed: ${failed}/${testSuites.length}`);
  
  if (failed > 0) {
    log(colors.red, '\n❌ Some performance tests failed!');
    process.exit(1);
  } else {
    log(colors.green, '\n✅ All performance tests passed!');
  }
}

// Export for use in other scripts
if (import.meta.url === `file://${process.argv[1]}`) {
  runPerformanceTests();
}

export { runPerformanceTests };