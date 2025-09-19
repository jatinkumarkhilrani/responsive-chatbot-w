#!/usr/bin/env node

/**
 * Comprehensive Test Runner
 * Validates all fixes and prevents regression
 * 
 * This script combines all individual test scripts and provides
 * a complete validation of the application before deployment
 */

import { fileURLToPath } from 'url';
import path from 'path';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

// ANSI colors
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

async function runTestScript(scriptPath, scriptName) {
  log(colors.blue, `\n🚀 Running ${scriptName}...`);
  
  try {
    const { runBasicTests } = await import(scriptPath);
    if (typeof runBasicTests === 'function') {
      runBasicTests();
      return true;
    } else {
      throw new Error('Test function not found');
    }
  } catch (error) {
    log(colors.red, `❌ ${scriptName} failed: ${error.message}`);
    return false;
  }
}

async function main() {
  log(colors.bold + colors.magenta, '🧪 Comprehensive Test Runner');
  log(colors.bold + colors.magenta, '==================================\n');

  let totalPassed = 0;
  let totalFailed = 0;
  const testResults = [];

  // Import and run all test modules
  const testModules = [
    { 
      path: './test-basic.js', 
      name: 'Basic Tests',
      description: 'Essential file structure and configuration' 
    },
    { 
      path: './test-ui.js', 
      name: 'UI Tests',
      description: 'Component structure and responsive design' 
    },
    { 
      path: './test-performance.js', 
      name: 'Performance Tests',
      description: 'Bundle size and memory optimization' 
    },
    { 
      path: './test-comprehensive.js', 
      name: 'Comprehensive Tests',
      description: 'Complete application validation' 
    }
  ];

  for (const testModule of testModules) {
    log(colors.cyan, `\n📋 ${testModule.name}`);
    log(colors.white, `   ${testModule.description}`);
    
    try {
      const startTime = Date.now();
      
      // Try to run the test
      let success = false;
      if (testModule.path === './test-basic.js') {
        const { runBasicTests } = await import(path.resolve(__dirname, 'test-basic.js'));
        try {
          runBasicTests();
          success = true;
        } catch (e) {
          success = false;
        }
      } else if (testModule.path === './test-ui.js') {
        const { runUITests } = await import(path.resolve(__dirname, 'test-ui.js'));
        try {
          runUITests();
          success = true;
        } catch (e) {
          success = false;
        }
      } else if (testModule.path === './test-performance.js') {
        const { runPerformanceTests } = await import(path.resolve(__dirname, 'test-performance.js'));
        try {
          runPerformanceTests();
          success = true;
        } catch (e) {
          success = false;
        }
      } else if (testModule.path === './test-comprehensive.js') {
        const { runAllTests } = await import(path.resolve(__dirname, 'test-comprehensive.js'));
        try {
          runAllTests();
          success = true;
        } catch (e) {
          success = false;
        }
      }
      
      const duration = Date.now() - startTime;
      
      if (success) {
        log(colors.green, `   ✅ ${testModule.name} passed (${duration}ms)`);
        totalPassed++;
        testResults.push({ name: testModule.name, status: 'PASSED', duration });
      } else {
        log(colors.red, `   ❌ ${testModule.name} failed (${duration}ms)`);
        totalFailed++;
        testResults.push({ name: testModule.name, status: 'FAILED', duration });
      }
    } catch (error) {
      log(colors.red, `   ❌ ${testModule.name} crashed: ${error.message}`);
      totalFailed++;
      testResults.push({ name: testModule.name, status: 'CRASHED', duration: 0 });
    }
  }

  // Summary Report
  log(colors.bold + colors.cyan, '\n📊 Test Summary Report');
  log(colors.cyan, '========================');
  
  for (const result of testResults) {
    const statusColor = result.status === 'PASSED' ? colors.green : colors.red;
    log(statusColor, `${result.status.padEnd(8)} | ${result.name.padEnd(20)} | ${result.duration}ms`);
  }

  log(colors.bold + colors.white, '\n📈 Statistics:');
  log(colors.green, `✅ Passed: ${totalPassed}`);
  log(colors.red, `❌ Failed: ${totalFailed}`);
  log(colors.white, `🔄 Total: ${totalPassed + totalFailed}`);

  // Final verdict
  if (totalFailed === 0) {
    log(colors.bold + colors.green, '\n🎉 ALL TESTS PASSED!');
    log(colors.green, '🚀 Application is ready for deployment');
    process.exit(0);
  } else {
    log(colors.bold + colors.red, '\n💥 SOME TESTS FAILED!');
    log(colors.red, '🔧 Please fix the issues before deploying');
    process.exit(1);
  }
}

// Run only if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(error => {
    log(colors.red, `💥 Test runner crashed: ${error.message}`);
    process.exit(1);
  });
}

export { main as runComprehensiveTestSuite };