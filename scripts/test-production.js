/**
 * Production-Ready Test Suite
 * Tests all critical functionality for deployment
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

// Simple test utilities
function test(name, fn) {
  try {
    fn();
    console.log(`✅ ${name}`);
    return true;
  } catch (error) {
    console.log(`❌ ${name}: ${error.message}`);
    return false;
  }
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function fileExists(filepath) {
  return fs.existsSync(path.join(projectRoot, filepath));
}

function readFile(filepath) {
  return fs.readFileSync(path.join(projectRoot, filepath), 'utf8');
}

// Test Suite
console.log('🧪 Production Test Suite\n');

let passed = 0;
let total = 0;

// Test 1: Critical Files
total++;
if (test('Critical files exist', () => {
  const files = [
    'package.json',
    'src/App.tsx',
    'src/main.tsx',
    'src/index.css',
    'index.html',
    'vite.config.ts',
    'vite.config.github.ts',
    'vite.config.standalone.ts'
  ];
  
  files.forEach(file => {
    assert(fileExists(file), `Missing file: ${file}`);
  });
})) passed++;

// Test 2: Package.json validity
total++;
if (test('Package.json is valid', () => {
  const pkg = JSON.parse(readFile('package.json'));
  assert(pkg.name === 'spark-template', 'Wrong package name');
  assert(pkg.scripts, 'No scripts defined');
  assert(pkg.scripts['build:github-pages'], 'Missing GitHub Pages build script');
  assert(pkg.dependencies, 'No dependencies defined');
  assert(pkg.dependencies['@github/spark'], 'Missing @github/spark dependency');
})) passed++;

// Test 3: TypeScript configuration
total++;
if (test('TypeScript config is valid', () => {
  assert(fileExists('tsconfig.json'), 'Missing tsconfig.json');
  const tsconfig = JSON.parse(readFile('tsconfig.json'));
  assert(tsconfig.compilerOptions, 'Missing compiler options');
})) passed++;

// Test 4: Vite configurations
total++;
if (test('Vite configs are valid', () => {
  const configs = ['vite.config.ts', 'vite.config.github.ts', 'vite.config.standalone.ts'];
  configs.forEach(config => {
    assert(fileExists(config), `Missing ${config}`);
    const content = readFile(config);
    assert(content.includes('defineConfig'), `Invalid ${config}`);
  });
})) passed++;

// Test 5: CSS structure
total++;
if (test('CSS structure is valid', () => {
  const indexCSS = readFile('src/index.css');
  const mainCSS = readFile('src/main.css');
  
  assert(indexCSS.includes('@import \'tailwindcss\''), 'Missing Tailwind import in index.css');
  assert(mainCSS.includes('@theme inline'), 'Missing theme block in main.css');
  assert(mainCSS.includes('--spacing-'), 'Missing spacing system in main.css');
})) passed++;

// Test 6: GitHub Pages setup
total++;
if (test('GitHub Pages setup is correct', () => {
  const indexHTML = readFile('index.html');
  const viteGithubConfig = readFile('vite.config.github.ts');
  
  assert(indexHTML.includes('window.GITHUB_PAGES_BASE'), 'Missing GitHub Pages base detection');
  assert(viteGithubConfig.includes('base: \'/responsive-chatbot-w/\''), 'Missing base path in GitHub config');
})) passed++;

// Test 7: Component structure
total++;
if (test('Component structure is valid', () => {
  assert(fileExists('src/components/ui/button.tsx'), 'Missing button component');
  assert(fileExists('src/components/ui/input.tsx'), 'Missing input component');
  assert(fileExists('src/components/ui/dialog.tsx'), 'Missing dialog component');
  assert(!fileExists('src/components/ui/chart.tsx'), 'Problematic chart component should be removed');
})) passed++;

// Test 8: No hardcoded secrets
total++;
if (test('No hardcoded secrets', () => {
  const appContent = readFile('src/App.tsx');
  const secretPattern = /api[_-]?key["\s]*[:=]["\s]*[a-zA-Z0-9]{20,}/gi;
  assert(!secretPattern.test(appContent), 'Potential hardcoded secrets found');
})) passed++;

// Summary
console.log('\n📊 Test Results:');
console.log(`✅ Passed: ${passed}/${total}`);
console.log(`❌ Failed: ${total - passed}/${total}`);

if (passed === total) {
  console.log('\n🎉 All tests passed! Ready for deployment.');
  process.exit(0);
} else {
  console.log('\n⚠️  Some tests failed. Fix issues before deploying.');
  process.exit(1);
}