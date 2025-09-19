#!/usr/bin/env node

/**
 * Performance tests to ensure app doesn't hang browser
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
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

function runCommand(command, options = {}) {
  try {
    const result = execSync(command, { 
      cwd: projectRoot,
      encoding: 'utf8',
      stdio: 'pipe',
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

function testBundleSize() {
  log(colors.cyan, '\n=== Testing Bundle Size ===');
  
  const distPath = path.join(projectRoot, 'dist');
  if (!fs.existsSync(distPath)) {
    log(colors.yellow, '⚠️  No dist folder found, building first...');
    const buildResult = runCommand('npm run build:standalone');
    if (!buildResult.success) {
      log(colors.red, '❌ Build failed');
      return false;
    }
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
  
  const bundleSize = getDirectorySize(distPath);
  const bundleSizeMB = bundleSize / (1024 * 1024);
  
  log(colors.blue, `📦 Bundle size: ${bundleSizeMB.toFixed(2)} MB`);
  
  if (bundleSizeMB > 10) {
    log(colors.red, '❌ Bundle too large (>10MB) - will cause browser hangs');
    return false;
  } else if (bundleSizeMB > 5) {
    log(colors.yellow, '⚠️  Bundle getting large (>5MB) - monitor performance');
  } else {
    log(colors.green, '✅ Bundle size acceptable');
  }
  
  return true;
}

function testCodeComplexity() {
  log(colors.cyan, '\n=== Testing Code Complexity ===');
  
  // Check for potential performance issues in React components
  const appFile = path.join(projectRoot, 'src/App.tsx');
  const messagingAppFile = path.join(projectRoot, 'src/components/MessagingApp.tsx');
  
  const potentialIssues = [
    'new Array(1000)',
    'while(true)',
    'for(let i = 0; i < 10000',
    'setInterval(',
    'setTimeout(.*, 0)',
    'document.querySelectorAll',
    'useEffect(() => {}, [])', // Empty dependency array with complex logic
  ];
  
  let issuesFound = 0;
  
  [appFile, messagingAppFile].forEach(file => {
    if (fs.existsSync(file)) {
      const content = fs.readFileSync(file, 'utf8');
      
      potentialIssues.forEach(issue => {
        const regex = new RegExp(issue, 'gi');
        if (regex.test(content)) {
          log(colors.yellow, `⚠️  Potential performance issue in ${path.basename(file)}: ${issue}`);
          issuesFound++;
        }
      });
    }
  });
  
  if (issuesFound === 0) {
    log(colors.green, '✅ No obvious performance issues detected');
  } else {
    log(colors.yellow, `⚠️  Found ${issuesFound} potential performance issues`);
  }
  
  return issuesFound < 3; // Allow some warnings but not too many
}

function testMemoryUsage() {
  log(colors.cyan, '\n=== Testing Memory Usage Patterns ===');
  
  // Check for memory leak patterns
  const srcFiles = [
    'src/App.tsx',
    'src/components/MessagingApp.tsx',
    'src/hooks/useKV.ts'
  ];
  
  const memoryLeakPatterns = [
    'addEventListener(?!.*removeEventListener)',
    'setInterval(?!.*clearInterval)',
    'setTimeout(?!.*clearTimeout)',
    'new EventSource(?!.*close)',
    'new WebSocket(?!.*close)'
  ];
  
  let leakRisks = 0;
  
  srcFiles.forEach(file => {
    const filePath = path.join(projectRoot, file);
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      
      memoryLeakPatterns.forEach(pattern => {
        const regex = new RegExp(pattern, 'gi');
        if (regex.test(content)) {
          log(colors.yellow, `⚠️  Memory leak risk in ${path.basename(file)}: ${pattern}`);
          leakRisks++;
        }
      });
    }
  });
  
  if (leakRisks === 0) {
    log(colors.green, '✅ No obvious memory leak patterns detected');
  } else {
    log(colors.yellow, `⚠️  Found ${leakRisks} potential memory leak risks`);
  }
  
  return leakRisks < 2;
}

function runPerformanceTests() {
  log(colors.bold + colors.blue, '⚡ Running Performance Tests\n');
  
  const tests = [
    { name: 'Bundle Size', test: testBundleSize },
    { name: 'Code Complexity', test: testCodeComplexity },
    { name: 'Memory Usage', test: testMemoryUsage }
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
  
  log(colors.bold + colors.cyan, '\n=== Performance Test Summary ===');
  log(colors.green, `✅ Passed: ${passed}/${tests.length}`);
  log(colors.red, `❌ Failed: ${failed}/${tests.length}`);
  
  return failed === 0;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  runPerformanceTests();
}

export { runPerformanceTests, testBundleSize, testCodeComplexity, testMemoryUsage };