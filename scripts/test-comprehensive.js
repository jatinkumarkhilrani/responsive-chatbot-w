#!/usr/bin/env node

/**
 * Comprehensive Test Infrastructure
 * Addresses all production issues and creates regression testing
 */

const fs = require('fs');
const path = require('path');
const { execSync, spawn } = require('child_process');

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

// Test Suite 1: Package and Dependency Validation
function testDependencies() {
  log(colors.cyan, '\n=== Testing Dependencies ===');
  
  // Check package.json exists and is valid
  let pkg;
  try {
    pkg = JSON.parse(fs.readFileSync(path.join(projectRoot, 'package.json'), 'utf8'));
    log(colors.green, '✅ package.json is valid');
  } catch (error) {
    log(colors.red, '❌ package.json is invalid or missing');
    return false;
  }
  
  // Check required scripts
  const requiredScripts = [
    'build:github-pages',
    'build:standalone', 
    'test:ci',
    'test:ui',
    'test:performance'
  ];
  
  for (const script of requiredScripts) {
    if (pkg.scripts && pkg.scripts[script]) {
      log(colors.green, `✅ Script exists: ${script}`);
    } else {
      log(colors.red, `❌ Missing script: ${script}`);
      return false;
    }
  }
  
  // Validate node_modules
  if (!fs.existsSync(path.join(projectRoot, 'node_modules'))) {
    log(colors.red, '❌ node_modules not found - run npm install');
    return false;
  }
  
  log(colors.green, '✅ Dependencies validated');
  return true;
}

// Test Suite 2: TypeScript and Build Issues
function testTypeScriptBuild() {
  log(colors.cyan, '\n=== Testing TypeScript Build ===');
  
  // TypeScript type checking
  const typeCheck = runCommand('npm run test:types');
  if (!typeCheck.success) {
    log(colors.red, '❌ TypeScript type checking failed');
    log(colors.white, typeCheck.stderr);
    return false;
  }
  log(colors.green, '✅ TypeScript types valid');
  
  // Test standalone build
  log(colors.blue, '🔨 Testing standalone build...');
  const standaloneBuild = runCommand('npm run build:standalone');
  if (!standaloneBuild.success) {
    log(colors.red, '❌ Standalone build failed');
    log(colors.white, standaloneBuild.stderr);
    return false;
  }
  log(colors.green, '✅ Standalone build successful');
  
  // Test GitHub Pages build
  log(colors.blue, '🔨 Testing GitHub Pages build...');
  const githubBuild = runCommand('npm run build:github-pages');
  if (!githubBuild.success) {
    log(colors.red, '❌ GitHub Pages build failed');
    log(colors.white, githubBuild.stderr);
    return false;
  }
  log(colors.green, '✅ GitHub Pages build successful');
  
  return true;
}

// Test Suite 3: UI Responsiveness and Layout Issues
function testUIResponsiveness() {
  log(colors.cyan, '\n=== Testing UI Responsiveness ===');
  
  // Check CSS structure
  const indexCSS = fs.readFileSync(path.join(projectRoot, 'src/index.css'), 'utf8');
  
  // Verify responsive breakpoints
  const responsivePatterns = [
    '@media (max-width: 640px)',
    '@media (min-width: 641px)',
    '.messaging-app-container',
    '.sidebar-container',
    '.main-content-area',
    'height: 100vh',
    'height: 100dvh'
  ];
  
  for (const pattern of responsivePatterns) {
    if (indexCSS.includes(pattern)) {
      log(colors.green, `✅ Responsive pattern found: ${pattern}`);
    } else {
      log(colors.yellow, `⚠️  Responsive pattern missing: ${pattern}`);
    }
  }
  
  // Check for proper spacing system
  if (indexCSS.includes('--spacing-') && indexCSS.includes('@theme')) {
    log(colors.green, '✅ Spacing system configured');
  } else {
    log(colors.red, '❌ Spacing system missing - this causes Tailwind errors');
    return false;
  }
  
  // Validate main.css structure
  const mainCSS = fs.readFileSync(path.join(projectRoot, 'src/main.css'), 'utf8');
  if (mainCSS.includes('--spacing-') && mainCSS.includes('@theme inline')) {
    log(colors.green, '✅ Main CSS structure valid');
  } else {
    log(colors.red, '❌ Main CSS structure invalid');
    return false;
  }
  
  return true;
}

// Test Suite 4: Configuration and Environment Issues  
function testConfiguration() {
  log(colors.cyan, '\n=== Testing Configuration ===');
  
  // Check Vite configurations
  const configs = ['vite.config.ts', 'vite.config.github.ts', 'vite.config.standalone.ts'];
  for (const config of configs) {
    if (fs.existsSync(path.join(projectRoot, config))) {
      log(colors.green, `✅ Config exists: ${config}`);
    } else {
      log(colors.red, `❌ Config missing: ${config}`);
      return false;
    }
  }
  
  // Check TypeScript config
  if (fs.existsSync(path.join(projectRoot, 'tsconfig.json'))) {
    log(colors.green, '✅ TypeScript config exists');
  } else {
    log(colors.red, '❌ TypeScript config missing');
    return false;
  }
  
  // Check Tailwind config
  if (fs.existsSync(path.join(projectRoot, 'tailwind.config.js'))) {
    log(colors.green, '✅ Tailwind config exists');
  } else {
    log(colors.red, '❌ Tailwind config missing');
    return false;
  }
  
  return true;
}

// Test Suite 5: Critical File Structure
function testFileStructure() {
  log(colors.cyan, '\n=== Testing File Structure ===');
  
  const criticalFiles = [
    'src/App.tsx',
    'src/main.tsx', 
    'src/index.css',
    'src/main.css',
    'index.html',
    'src/components/ui/button.tsx',
    'src/components/ui/input.tsx',
    'src/components/ui/dialog.tsx'
  ];
  
  for (const file of criticalFiles) {
    if (fs.existsSync(path.join(projectRoot, file))) {
      log(colors.green, `✅ Critical file exists: ${file}`);
    } else {
      log(colors.red, `❌ Critical file missing: ${file}`);
      return false;
    }
  }
  
  // Check for problematic UI components that should be removed
  const problematicComponents = [
    'src/components/ui/accordion.tsx',
    'src/components/ui/calendar.tsx',
    'src/components/ui/chart.tsx'
  ];
  
  for (const file of problematicComponents) {
    if (!fs.existsSync(path.join(projectRoot, file))) {
      log(colors.green, `✅ Problematic component removed: ${file}`);
    } else {
      log(colors.yellow, `⚠️  Problematic component still exists: ${file}`);
    }
  }
  
  return true;
}

// Test Suite 6: Memory and Performance Issues
function testPerformance() {
  log(colors.cyan, '\n=== Testing Performance ===');
  
  // Check bundle size after build
  const distPath = path.join(projectRoot, 'dist');
  if (!fs.existsSync(distPath)) {
    log(colors.yellow, '⚠️  No dist folder found, build first');
    return true;
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
  
  log(colors.white, `📦 Bundle size: ${bundleSizeMB.toFixed(2)} MB`);
  
  if (bundleSizeMB > 5) {
    log(colors.red, '❌ Bundle too large (>5MB)');
    return false;
  } else if (bundleSizeMB > 2) {
    log(colors.yellow, '⚠️  Bundle getting large (>2MB)');
  } else {
    log(colors.green, '✅ Bundle size optimal');
  }
  
  return true;
}

// Test Suite 7: GitHub Pages Specific Issues
function testGitHubPagesCompatibility() {
  log(colors.cyan, '\n=== Testing GitHub Pages Compatibility ===');
  
  // Check index.html for GitHub Pages setup
  const indexHTML = fs.readFileSync(path.join(projectRoot, 'index.html'), 'utf8');
  
  const githubPagesPatterns = [
    'window.GITHUB_PAGES_BASE',
    'jatin-kumar-khilrani.github.io',
    'responsive-chatbot-w'
  ];
  
  for (const pattern of githubPagesPatterns) {
    if (indexHTML.includes(pattern)) {
      log(colors.green, `✅ GitHub Pages pattern found: ${pattern}`);
    } else {
      log(colors.yellow, `⚠️  GitHub Pages pattern missing: ${pattern}`);
    }
  }
  
  // Check for proper base path configuration
  const viteGithubConfig = fs.readFileSync(path.join(projectRoot, 'vite.config.github.ts'), 'utf8');
  if (viteGithubConfig.includes('base:') && viteGithubConfig.includes('/responsive-chatbot-w/')) {
    log(colors.green, '✅ Vite GitHub config has proper base path');
  } else {
    log(colors.red, '❌ Vite GitHub config missing proper base path');
    return false;
  }
  
  return true;
}

// Test Suite 8: Security and Code Quality
function testSecurity() {
  log(colors.cyan, '\n=== Testing Security ===');
  
  // Check for hardcoded secrets
  const filesToCheck = [
    'src/App.tsx',
    'src/components/MessagingApp.tsx'
  ];
  
  const secretPatterns = [
    /api[_-]?key["\s]*[:=]["\s]*[a-zA-Z0-9]{20,}/gi,
    /secret["\s]*[:=]["\s]*[a-zA-Z0-9]{20,}/gi,
    /token["\s]*[:=]["\s]*[a-zA-Z0-9]{20,}/gi
  ];
  
  for (const file of filesToCheck) {
    if (!fs.existsSync(path.join(projectRoot, file))) continue;
    
    const content = fs.readFileSync(path.join(projectRoot, file), 'utf8');
    const hasSecrets = secretPatterns.some(pattern => pattern.test(content));
    
    if (hasSecrets) {
      log(colors.red, `❌ Potential hardcoded secrets in ${file}`);
      return false;
    } else {
      log(colors.green, `✅ No hardcoded secrets in ${file}`);
    }
  }
  
  return true;
}

// Main test runner
function runAllTests() {
  log(colors.bold + colors.blue, '🧪 Running Comprehensive Test Infrastructure\n');
  
  const testSuites = [
    { name: 'Dependencies', test: testDependencies },
    { name: 'TypeScript Build', test: testTypeScriptBuild },
    { name: 'UI Responsiveness', test: testUIResponsiveness },
    { name: 'Configuration', test: testConfiguration },
    { name: 'File Structure', test: testFileStructure },
    { name: 'Performance', test: testPerformance },
    { name: 'GitHub Pages Compatibility', test: testGitHubPagesCompatibility },
    { name: 'Security', test: testSecurity }
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
  log(colors.bold + colors.cyan, '\n=== Test Summary ===');
  log(colors.green, `✅ Passed: ${passed}/${testSuites.length}`);
  log(colors.red, `❌ Failed: ${failed}/${testSuites.length}`);
  
  if (failed > 0) {
    log(colors.red, '\n❌ Some tests failed! Please fix issues before deploying.');
    process.exit(1);
  } else {
    log(colors.green, '\n✅ All tests passed! Ready for deployment.');
  }
}

// Export for use in other scripts
if (require.main === module) {
  runAllTests();
}

module.exports = { 
  runAllTests,
  testDependencies,
  testTypeScriptBuild,
  testUIResponsiveness,
  testConfiguration,
  testFileStructure,
  testPerformance,
  testGitHubPagesCompatibility,
  testSecurity
};