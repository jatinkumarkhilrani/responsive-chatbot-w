#!/usr/bin/env node

/**
 * Performance Testing Script for Sahaay Messaging App
 * Tests for bundle size, memory usage, and build performance
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const projectRoot = path.resolve(__dirname, '..');

// ANSI colors for console output
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(color, message) {
  console.log(`${color}${message}${colors.reset}`);
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function getDirectorySize(dirPath) {
  let totalSize = 0;
  
  if (!fs.existsSync(dirPath)) {
    return 0;
  }
  
  function calculateSize(itemPath) {
    const stats = fs.statSync(itemPath);
    if (stats.isDirectory()) {
      const files = fs.readdirSync(itemPath);
      files.forEach(file => {
        calculateSize(path.join(itemPath, file));
      });
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
    log(colors.yellow, '⚠️  Dist folder not found. Building first...');
    try {
      execSync('npm run build:standalone', { 
        cwd: projectRoot, 
        stdio: 'pipe' 
      });
    } catch (error) {
      log(colors.red, '❌ Build failed, cannot test bundle size');
      return false;
    }
  }
  
  const totalSize = getDirectorySize(distPath);
  const totalSizeMB = totalSize / (1024 * 1024);
  
  log(colors.white, `📦 Total bundle size: ${formatBytes(totalSize)}`);
  
  // Check individual file sizes
  const files = fs.readdirSync(distPath);
  const jsFiles = files.filter(file => file.endsWith('.js'));
  const cssFiles = files.filter(file => file.endsWith('.css'));
  
  // JavaScript bundle size check
  let largestJS = 0;
  let largestJSFile = '';
  
  jsFiles.forEach(file => {
    const filePath = path.join(distPath, file);
    const size = fs.statSync(filePath).size;
    if (size > largestJS) {
      largestJS = size;
      largestJSFile = file;
    }
  });
  
  if (largestJS > 0) {
    log(colors.white, `📄 Largest JS file: ${largestJSFile} (${formatBytes(largestJS)})`);
    
    // Warn if JS bundle is too large
    if (largestJS > 1024 * 1024) { // 1MB
      log(colors.yellow, '⚠️  JavaScript bundle is large (>1MB). Consider code splitting.');
    } else {
      log(colors.green, '✅ JavaScript bundle size is reasonable');
    }
  }
  
  // CSS bundle size check
  let largestCSS = 0;
  let largestCSSFile = '';
  
  cssFiles.forEach(file => {
    const filePath = path.join(distPath, file);
    const size = fs.statSync(filePath).size;
    if (size > largestCSS) {
      largestCSS = size;
      largestCSSFile = file;
    }
  });
  
  if (largestCSS > 0) {
    log(colors.white, `🎨 Largest CSS file: ${largestCSSFile} (${formatBytes(largestCSS)})`);
    
    if (largestCSS > 512 * 1024) { // 512KB
      log(colors.yellow, '⚠️  CSS bundle is large (>512KB). Consider purging unused styles.');
    } else {
      log(colors.green, '✅ CSS bundle size is reasonable');
    }
  }
  
  // Overall size check
  if (totalSizeMB > 5) {
    log(colors.red, '❌ Total bundle size is too large (>5MB)');
    return false;
  } else if (totalSizeMB > 2) {
    log(colors.yellow, '⚠️  Bundle size is getting large (>2MB)');
    return true;
  } else {
    log(colors.green, '✅ Bundle size is optimal');
    return true;
  }
}

function testBuildPerformance() {
  log(colors.cyan, '\n=== Testing Build Performance ===');
  
  const startTime = Date.now();
  
  try {
    log(colors.white, '🔨 Building for standalone...');
    execSync('npm run build:standalone', { 
      cwd: projectRoot, 
      stdio: 'pipe' 
    });
    
    const buildTime = Date.now() - startTime;
    log(colors.white, `⏱️  Build time: ${buildTime}ms`);
    
    if (buildTime > 60000) { // 1 minute
      log(colors.red, '❌ Build is too slow (>1 minute)');
      return false;
    } else if (buildTime > 30000) { // 30 seconds
      log(colors.yellow, '⚠️  Build is slow (>30 seconds)');
      return true;
    } else {
      log(colors.green, '✅ Build performance is good');
      return true;
    }
  } catch (error) {
    log(colors.red, '❌ Build failed');
    console.error(error.message);
    return false;
  }
}

function testDependencySize() {
  log(colors.cyan, '\n=== Testing Dependency Size ===');
  
  const nodeModulesPath = path.join(projectRoot, 'node_modules');
  
  if (!fs.existsSync(nodeModulesPath)) {
    log(colors.red, '❌ node_modules not found');
    return false;
  }
  
  const nodeModulesSize = getDirectorySize(nodeModulesPath);
  const nodeModulesSizeMB = nodeModulesSize / (1024 * 1024);
  
  log(colors.white, `📦 node_modules size: ${formatBytes(nodeModulesSize)}`);
  
  if (nodeModulesSizeMB > 500) { // 500MB
    log(colors.red, '❌ Dependencies are too large (>500MB)');
    return false;
  } else if (nodeModulesSizeMB > 200) { // 200MB
    log(colors.yellow, '⚠️  Dependencies are large (>200MB)');
    return true;
  } else {
    log(colors.green, '✅ Dependency size is reasonable');
    return true;
  }
}

function testSourceMapSize() {
  log(colors.cyan, '\n=== Testing Source Map Size ===');
  
  const distPath = path.join(projectRoot, 'dist');
  
  if (!fs.existsSync(distPath)) {
    log(colors.yellow, '⚠️  Dist folder not found');
    return true;
  }
  
  const files = fs.readdirSync(distPath);
  const mapFiles = files.filter(file => file.endsWith('.map'));
  
  if (mapFiles.length === 0) {
    log(colors.green, '✅ No source maps in production build (good for size)');
    return true;
  }
  
  let totalMapSize = 0;
  mapFiles.forEach(file => {
    const filePath = path.join(distPath, file);
    totalMapSize += fs.statSync(filePath).size;
  });
  
  log(colors.white, `🗺️  Source maps size: ${formatBytes(totalMapSize)}`);
  
  const totalBundleSize = getDirectorySize(distPath) - totalMapSize;
  const mapRatio = totalMapSize / totalBundleSize;
  
  if (mapRatio > 2) {
    log(colors.yellow, '⚠️  Source maps are very large relative to bundle');
  } else {
    log(colors.green, '✅ Source map size is reasonable');
  }
  
  return true;
}

function testMemoryUsage() {
  log(colors.cyan, '\n=== Testing Memory Usage ===');
  
  const used = process.memoryUsage();
  
  log(colors.white, `💾 RSS: ${formatBytes(used.rss)}`);
  log(colors.white, `💾 Heap Used: ${formatBytes(used.heapUsed)}`);
  log(colors.white, `💾 Heap Total: ${formatBytes(used.heapTotal)}`);
  log(colors.white, `💾 External: ${formatBytes(used.external)}`);
  
  const heapUsedMB = used.heapUsed / (1024 * 1024);
  
  if (heapUsedMB > 100) {
    log(colors.yellow, '⚠️  High memory usage during build');
    return true;
  } else {
    log(colors.green, '✅ Memory usage is reasonable');
    return true;
  }
}

function testAssetOptimization() {
  log(colors.cyan, '\n=== Testing Asset Optimization ===');
  
  const distPath = path.join(projectRoot, 'dist');
  
  if (!fs.existsSync(distPath)) {
    log(colors.yellow, '⚠️  Dist folder not found');
    return true;
  }
  
  const files = fs.readdirSync(distPath);
  
  // Check for uncompressed images
  const imageFiles = files.filter(file => 
    file.endsWith('.png') || file.endsWith('.jpg') || file.endsWith('.jpeg')
  );
  
  let largeImages = 0;
  imageFiles.forEach(file => {
    const filePath = path.join(distPath, file);
    const size = fs.statSync(filePath).size;
    if (size > 100 * 1024) { // 100KB
      largeImages++;
      log(colors.yellow, `⚠️  Large image: ${file} (${formatBytes(size)})`);
    }
  });
  
  if (largeImages === 0) {
    log(colors.green, '✅ No large unoptimized images found');
  }
  
  // Check for gzip compression (in build output)
  const gzipFiles = files.filter(file => file.endsWith('.gz'));
  if (gzipFiles.length > 0) {
    log(colors.green, '✅ Gzip compression enabled');
  } else {
    log(colors.yellow, '⚠️  Consider enabling gzip compression');
  }
  
  return true;
}

function runPerformanceTests() {
  log(colors.bold + colors.blue, '⚡ Starting Performance Testing Suite\n');
  
  const results = [
    testBuildPerformance(),
    testBundleSize(),
    testDependencySize(),
    testSourceMapSize(),
    testMemoryUsage(),
    testAssetOptimization()
  ];
  
  const failedTests = results.filter(result => !result).length;
  const passedTests = results.filter(result => result).length;
  
  // Print summary
  log(colors.bold + colors.cyan, '\n=== Performance Test Summary ===');
  log(colors.green, `✅ Passed: ${passedTests}`);
  log(colors.red, `❌ Failed: ${failedTests}`);
  
  if (failedTests > 0) {
    log(colors.red, '\n❌ Performance tests failed! Please optimize before deploying.');
    process.exit(1);
  } else {
    log(colors.green, '\n✅ All performance tests passed!');
  }
}

// Run tests if called directly
if (require.main === module) {
  runPerformanceTests();
}

module.exports = { runPerformanceTests };