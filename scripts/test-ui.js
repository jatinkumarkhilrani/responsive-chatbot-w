#!/usr/bin/env node

/**
 * Comprehensive UI Testing Script for Sahaay Messaging App
 * Tests for responsive design, UI bugs, and build issues
 */

const fs = require('fs');
const path = require('path');

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

// Test results tracking
let testResults = {
  passed: 0,
  failed: 0,
  warnings: 0,
  tests: []
};

function log(color, message) {
  console.log(`${color}${message}${colors.reset}`);
}

function logTest(name, status, message = '') {
  const statusColor = status === 'PASS' ? colors.green : 
                     status === 'FAIL' ? colors.red : colors.yellow;
  log(statusColor, `[${status}] ${name}`);
  if (message) {
    console.log(`       ${message}`);
  }
  
  testResults.tests.push({ name, status, message });
  if (status === 'PASS') testResults.passed++;
  else if (status === 'FAIL') testResults.failed++;
  else testResults.warnings++;
}

function readFile(relativePath) {
  try {
    return fs.readFileSync(path.resolve(projectRoot, relativePath), 'utf8');
  } catch (error) {
    return null;
  }
}

// Test 1: Check for required files
function testRequiredFiles() {
  log(colors.cyan, '\n=== Testing Required Files ===');
  
  const requiredFiles = [
    'src/App.tsx',
    'src/index.css',
    'src/main.tsx',
    'index.html',
    'vite.config.ts',
    'vite.config.github.ts',
    'tailwind.config.js',
    'package.json'
  ];
  
  for (const file of requiredFiles) {
    if (fs.existsSync(path.resolve(projectRoot, file))) {
      logTest(`File exists: ${file}`, 'PASS');
    } else {
      logTest(`File missing: ${file}`, 'FAIL', 'Required file not found');
    }
  }
}

// Test 2: Check package.json for required scripts and dependencies
function testPackageJson() {
  log(colors.cyan, '\n=== Testing Package Configuration ===');
  
  const packageJson = readFile('package.json');
  if (!packageJson) {
    logTest('package.json readable', 'FAIL', 'Cannot read package.json');
    return;
  }
  
  let pkg;
  try {
    pkg = JSON.parse(packageJson);
  } catch (error) {
    logTest('package.json valid JSON', 'FAIL', 'Invalid JSON format');
    return;
  }
  
  // Check required scripts
  const requiredScripts = ['build:github', 'build:github-pages', 'test:ci'];
  for (const script of requiredScripts) {
    if (pkg.scripts && pkg.scripts[script]) {
      logTest(`Script exists: ${script}`, 'PASS');
    } else {
      logTest(`Script missing: ${script}`, 'FAIL', 'Required for GitHub Pages deployment');
    }
  }
  
  // Check critical dependencies
  const requiredDeps = [
    'react',
    'react-dom',
    '@tailwindcss/vite',
    '@phosphor-icons/react',
    'tailwindcss',
    'vite'
  ];
  
  const allDeps = { ...pkg.dependencies, ...pkg.devDependencies };
  for (const dep of requiredDeps) {
    if (allDeps[dep]) {
      logTest(`Dependency exists: ${dep}`, 'PASS');
    } else {
      logTest(`Dependency missing: ${dep}`, 'FAIL', 'Critical dependency not found');
    }
  }
}

// Test 3: Check CSS and Tailwind configuration
function testCSSConfiguration() {
  log(colors.cyan, '\n=== Testing CSS Configuration ===');
  
  const indexCSS = readFile('src/index.css');
  if (!indexCSS) {
    logTest('index.css readable', 'FAIL');
    return;
  }
  
  // Check for required imports
  const requiredImports = [
    '@import \'tailwindcss\'',
    '@import "tw-animate-css"'
  ];
  
  for (const importStatement of requiredImports) {
    if (indexCSS.includes(importStatement)) {
      logTest(`CSS import: ${importStatement}`, 'PASS');
    } else {
      logTest(`CSS import missing: ${importStatement}`, 'FAIL');
    }
  }
  
  // Check for CSS variables
  const requiredVariables = [
    '--background:',
    '--foreground:',
    '--primary:',
    '--secondary:',
    '--border:',
    '--radius:'
  ];
  
  for (const variable of requiredVariables) {
    if (indexCSS.includes(variable)) {
      logTest(`CSS variable: ${variable}`, 'PASS');
    } else {
      logTest(`CSS variable missing: ${variable}`, 'FAIL');
    }
  }
  
  // Check for @theme block
  if (indexCSS.includes('@theme')) {
    logTest('Tailwind @theme block', 'PASS');
  } else {
    logTest('Tailwind @theme block', 'FAIL', 'Required for color mapping');
  }
  
  // Check for responsive utilities
  const responsivePatterns = [
    '.messaging-app-container',
    '.sidebar-container',
    '.main-content-area',
    '@media (max-width: 640px)',
    '@media (min-width: 641px)'
  ];
  
  for (const pattern of responsivePatterns) {
    if (indexCSS.includes(pattern)) {
      logTest(`Responsive pattern: ${pattern}`, 'PASS');
    } else {
      logTest(`Responsive pattern missing: ${pattern}`, 'WARN', 'May affect mobile layout');
    }
  }
}

// Test 4: Check HTML configuration
function testHTMLConfiguration() {
  log(colors.cyan, '\n=== Testing HTML Configuration ===');
  
  const html = readFile('index.html');
  if (!html) {
    logTest('index.html readable', 'FAIL');
    return;
  }
  
  // Check for meta tags
  const requiredMeta = [
    'charset="UTF-8"',
    'name="viewport"',
    'name="description"',
    'property="og:title"'
  ];
  
  for (const meta of requiredMeta) {
    if (html.includes(meta)) {
      logTest(`Meta tag: ${meta}`, 'PASS');
    } else {
      logTest(`Meta tag missing: ${meta}`, 'WARN', 'SEO/accessibility consideration');
    }
  }
  
  // Check for required links and scripts
  const requiredLinks = [
    'href="./src/index.css"',
    'fonts.googleapis.com',
    'src="./src/main.tsx"'
  ];
  
  for (const link of requiredLinks) {
    if (html.includes(link)) {
      logTest(`HTML link/script: ${link}`, 'PASS');
    } else {
      logTest(`HTML link/script missing: ${link}`, 'FAIL');
    }
  }
  
  // Check for GitHub Pages configuration
  if (html.includes('window.GITHUB_PAGES_BASE')) {
    logTest('GitHub Pages base path config', 'PASS');
  } else {
    logTest('GitHub Pages base path config', 'WARN', 'May affect GitHub Pages routing');
  }
}

// Test 5: Check React component structure
function testReactComponents() {
  log(colors.cyan, '\n=== Testing React Components ===');
  
  const appTsx = readFile('src/App.tsx');
  if (!appTsx) {
    logTest('App.tsx readable', 'FAIL');
    return;
  }
  
  // Check for required imports
  const requiredImports = [
    'import { memo, Suspense }',
    'import { ErrorBoundary }',
    'import { Toaster }',
    'QueryClient',
    'QueryClientProvider'
  ];
  
  for (const importStatement of requiredImports) {
    if (appTsx.includes(importStatement)) {
      logTest(`React import: ${importStatement}`, 'PASS');
    } else {
      logTest(`React import missing: ${importStatement}`, 'WARN', 'May affect functionality');
    }
  }
  
  // Check for error boundaries and suspense
  if (appTsx.includes('ErrorBoundary') && appTsx.includes('Suspense')) {
    logTest('Error handling components', 'PASS');
  } else {
    logTest('Error handling components', 'FAIL', 'ErrorBoundary and Suspense required');
  }
  
  // Check for memoization
  if (appTsx.includes('memo(')) {
    logTest('Component memoization', 'PASS');
  } else {
    logTest('Component memoization', 'WARN', 'Consider using React.memo for performance');
  }
}

// Test 6: Check TypeScript configuration
function testTypeScriptConfig() {
  log(colors.cyan, '\n=== Testing TypeScript Configuration ===');
  
  const tsConfig = readFile('tsconfig.json');
  if (!tsConfig) {
    logTest('tsconfig.json readable', 'FAIL');
    return;
  }
  
  let config;
  try {
    config = JSON.parse(tsConfig);
  } catch (error) {
    logTest('tsconfig.json valid JSON', 'FAIL');
    return;
  }
  
  // Check for required compiler options
  const requiredOptions = {
    'target': 'ES2020',
    'lib': ['ES2020', 'DOM', 'DOM.Iterable'],
    'module': 'ESNext',
    'moduleResolution': 'bundler',
    'jsx': 'react-jsx'
  };
  
  if (config.compilerOptions) {
    for (const [option, expectedValue] of Object.entries(requiredOptions)) {
      const actualValue = config.compilerOptions[option];
      if (Array.isArray(expectedValue)) {
        const hasAllValues = expectedValue.every(val => 
          Array.isArray(actualValue) && actualValue.includes(val)
        );
        if (hasAllValues) {
          logTest(`TS option: ${option}`, 'PASS');
        } else {
          logTest(`TS option: ${option}`, 'WARN', `Expected ${JSON.stringify(expectedValue)}, got ${JSON.stringify(actualValue)}`);
        }
      } else {
        if (actualValue === expectedValue) {
          logTest(`TS option: ${option}`, 'PASS');
        } else {
          logTest(`TS option: ${option}`, 'WARN', `Expected ${expectedValue}, got ${actualValue}`);
        }
      }
    }
  } else {
    logTest('TypeScript compiler options', 'FAIL', 'No compilerOptions found');
  }
}

// Test 7: Check for common UI issues
function testUIPatterns() {
  log(colors.cyan, '\n=== Testing UI Patterns ===');
  
  // Check all TypeScript/JSX files for common issues
  const srcFiles = [
    'src/App.tsx',
    'src/components/MessagingApp.tsx',
    'src/components/Sidebar.tsx',
    'src/components/ChatInterface.tsx',
    'src/components/Settings.tsx'
  ];
  
  for (const file of srcFiles) {
    const content = readFile(file);
    if (!content) continue;
    
    // Check for responsive classes
    const responsivePatterns = [
      'sm:', 'md:', 'lg:', 'xl:', '2xl:',
      'max-w-', 'min-w-', 'w-full', 'h-full'
    ];
    
    const hasResponsive = responsivePatterns.some(pattern => content.includes(pattern));
    if (hasResponsive) {
      logTest(`Responsive classes in ${file}`, 'PASS');
    } else {
      logTest(`Responsive classes in ${file}`, 'WARN', 'Consider adding responsive utilities');
    }
    
    // Check for accessibility attributes
    const a11yPatterns = [
      'aria-', 'role=', 'alt=', 'tabIndex'
    ];
    
    const hasA11y = a11yPatterns.some(pattern => content.includes(pattern));
    if (hasA11y) {
      logTest(`Accessibility attributes in ${file}`, 'PASS');
    } else {
      logTest(`Accessibility attributes in ${file}`, 'WARN', 'Consider adding ARIA attributes');
    }
    
    // Check for proper state management
    if (content.includes('useState') || content.includes('useKV')) {
      logTest(`State management in ${file}`, 'PASS');
    } else if (content.includes('function') || content.includes('const')) {
      logTest(`State management in ${file}`, 'WARN', 'Consider if state is needed');
    }
  }
}

// Test 8: Check Vite configuration
function testViteConfig() {
  log(colors.cyan, '\n=== Testing Vite Configuration ===');
  
  const viteConfig = readFile('vite.config.ts');
  const viteGithubConfig = readFile('vite.config.github.ts');
  
  if (!viteConfig) {
    logTest('vite.config.ts readable', 'FAIL');
  } else {
    // Check for required plugins
    const requiredPlugins = ['react()', 'tailwindcss()'];
    for (const plugin of requiredPlugins) {
      if (viteConfig.includes(plugin)) {
        logTest(`Vite plugin: ${plugin}`, 'PASS');
      } else {
        logTest(`Vite plugin missing: ${plugin}`, 'FAIL');
      }
    }
    
    // Check for alias configuration
    if (viteConfig.includes('alias')) {
      logTest('Vite path aliases', 'PASS');
    } else {
      logTest('Vite path aliases', 'WARN', 'Consider adding path aliases for cleaner imports');
    }
  }
  
  if (!viteGithubConfig) {
    logTest('vite.config.github.ts readable', 'FAIL', 'Required for GitHub Pages build');
  } else {
    // Check for GitHub Pages specific configuration
    if (viteGithubConfig.includes('base:')) {
      logTest('GitHub Pages base path', 'PASS');
    } else {
      logTest('GitHub Pages base path', 'FAIL', 'Required for proper GitHub Pages routing');
    }
    
    if (viteGithubConfig.includes('manualChunks')) {
      logTest('Bundle optimization', 'PASS');
    } else {
      logTest('Bundle optimization', 'WARN', 'Consider adding chunk splitting for better performance');
    }
  }
}

// Test 9: Check for performance issues
function testPerformancePatterns() {
  log(colors.cyan, '\n=== Testing Performance Patterns ===');
  
  const files = [
    'src/App.tsx',
    'src/components/MessagingApp.tsx'
  ];
  
  for (const file of files) {
    const content = readFile(file);
    if (!content) continue;
    
    // Check for React.memo usage
    if (content.includes('memo(')) {
      logTest(`Memoization in ${file}`, 'PASS');
    } else if (content.includes('export default function') || content.includes('const ')) {
      logTest(`Memoization in ${file}`, 'WARN', 'Consider using React.memo for performance');
    }
    
    // Check for lazy loading
    if (content.includes('lazy(') || content.includes('Suspense')) {
      logTest(`Lazy loading in ${file}`, 'PASS');
    } else {
      logTest(`Lazy loading in ${file}`, 'WARN', 'Consider lazy loading for large components');
    }
    
    // Check for large inline objects (potential performance issue)
    const largeObjectPattern = /\{[^}]{200,}\}/g;
    if (largeObjectPattern.test(content)) {
      logTest(`Large inline objects in ${file}`, 'WARN', 'Consider extracting large objects to constants');
    } else {
      logTest(`Large inline objects in ${file}`, 'PASS');
    }
  }
}

// Test 10: Security checks
function testSecurity() {
  log(colors.cyan, '\n=== Testing Security Patterns ===');
  
  const files = [
    'src/App.tsx',
    'src/components/MessagingApp.tsx',
    'src/services/aiService.ts'
  ];
  
  for (const file of files) {
    const content = readFile(file);
    if (!content) continue;
    
    // Check for potential XSS vulnerabilities
    if (content.includes('dangerouslySetInnerHTML')) {
      logTest(`XSS risk in ${file}`, 'WARN', 'dangerouslySetInnerHTML detected - ensure content is sanitized');
    } else {
      logTest(`XSS protection in ${file}`, 'PASS');
    }
    
    // Check for hardcoded secrets (basic patterns)
    const secretPatterns = [
      /api[_-]?key["\s]*[:=]["\s]*[a-zA-Z0-9]{20,}/gi,
      /secret["\s]*[:=]["\s]*[a-zA-Z0-9]{20,}/gi,
      /token["\s]*[:=]["\s]*[a-zA-Z0-9]{20,}/gi
    ];
    
    const hasSecrets = secretPatterns.some(pattern => pattern.test(content));
    if (hasSecrets) {
      logTest(`Hardcoded secrets in ${file}`, 'FAIL', 'Potential hardcoded API keys or secrets detected');
    } else {
      logTest(`No hardcoded secrets in ${file}`, 'PASS');
    }
  }
  
  // Check environment variable usage
  const envFiles = ['src/services/aiService.ts', 'src/config.ts'];
  for (const file of envFiles) {
    const content = readFile(file);
    if (!content) continue;
    
    if (content.includes('process.env') || content.includes('import.meta.env')) {
      logTest(`Environment variables in ${file}`, 'PASS');
    } else if (content.includes('API') || content.includes('key')) {
      logTest(`Environment variables in ${file}`, 'WARN', 'Consider using environment variables for API keys');
    }
  }
}

// Main test runner
function runAllTests() {
  log(colors.bold + colors.blue, '🧪 Starting Comprehensive UI Testing Suite for Sahaay\n');
  
  testRequiredFiles();
  testPackageJson();
  testCSSConfiguration();
  testHTMLConfiguration();
  testReactComponents();
  testTypeScriptConfig();
  testUIPatterns();
  testViteConfig();
  testPerformancePatterns();
  testSecurity();
  
  // Print summary
  log(colors.bold + colors.cyan, '\n=== Test Summary ===');
  log(colors.green, `✅ Passed: ${testResults.passed}`);
  log(colors.yellow, `⚠️  Warnings: ${testResults.warnings}`);
  log(colors.red, `❌ Failed: ${testResults.failed}`);
  log(colors.white, `📊 Total: ${testResults.tests.length}`);
  
  if (testResults.failed > 0) {
    log(colors.red, '\n❌ Tests failed! Please fix the issues above before deploying.');
    process.exit(1);
  } else if (testResults.warnings > 5) {
    log(colors.yellow, '\n⚠️  Many warnings detected. Consider addressing them for better quality.');
  } else {
    log(colors.green, '\n✅ All critical tests passed! Ready for deployment.');
  }
}

// Run tests if called directly
if (require.main === module) {
  runAllTests();
}

module.exports = { runAllTests, testResults };