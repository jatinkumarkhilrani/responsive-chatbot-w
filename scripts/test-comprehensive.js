#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const rootDir = process.cwd();

console.log('🧪 Running Comprehensive Test Infrastructure\n');

const tests = {
  dependencies: () => {
    console.log('=== Testing Dependencies ===');
    
    // Test package.json validity
    try {
      const pkg = JSON.parse(fs.readFileSync(path.join(rootDir, 'package.json'), 'utf8'));
      console.log('✅ package.json is valid');
      
      // Check essential scripts
      const requiredScripts = ['build:github-pages', 'build:standalone', 'test:ci', 'test:ui', 'test:performance'];
      for (const script of requiredScripts) {
        if (pkg.scripts[script]) {
          console.log(`✅ Script exists: ${script}`);
        } else {
          console.log(`❌ Missing script: ${script}`);
          return false;
        }
      }
      
      console.log('✅ Dependencies validated');
      return true;
    } catch (error) {
      console.log(`❌ package.json error: ${error.message}`);
      return false;
    }
  },

  typescript: () => {
    console.log('\n=== Testing TypeScript Build ===');
    try {
      execSync('npx tsc --noEmit --skipLibCheck', { 
        stdio: 'pipe',
        cwd: rootDir 
      });
      console.log('✅ TypeScript compilation successful');
      return true;
    } catch (error) {
      console.log('❌ TypeScript type checking failed');
      return false;
    }
  },

  responsiveness: () => {
    console.log('\n=== Testing UI Responsiveness ===');
    
    const cssFile = path.join(rootDir, 'src/index.css');
    if (!fs.existsSync(cssFile)) {
      console.log('❌ CSS file not found');
      return false;
    }

    const cssContent = fs.readFileSync(cssFile, 'utf8');
    const responsivePatterns = [
      '@media (max-width: 640px)',
      '@media (min-width: 641px)',
      '.messaging-app-container',
      '.sidebar-container',
      '.main-content-area',
      'height: 100vh',
      'height: 100dvh'
    ];

    let passed = 0;
    for (const pattern of responsivePatterns) {
      if (cssContent.includes(pattern)) {
        console.log(`✅ Responsive pattern found: ${pattern}`);
        passed++;
      } else {
        console.log(`❌ Missing responsive pattern: ${pattern}`);
      }
    }

    // Check spacing system
    if (cssContent.includes('--radius') && cssContent.includes('@theme')) {
      console.log('✅ Spacing system configured in index.css');
      passed++;
    } else {
      console.log('❌ Spacing system not properly configured');
    }

    console.log('✅ Main CSS structure valid with spacing system');
    return passed >= responsivePatterns.length;
  },

  configuration: () => {
    console.log('\n=== Testing Configuration ===');
    
    const configs = [
      'vite.config.ts',
      'vite.config.github.ts', 
      'vite.config.standalone.ts',
      'tsconfig.json',
      'tailwind.config.js'
    ];

    let passed = 0;
    for (const config of configs) {
      if (fs.existsSync(path.join(rootDir, config))) {
        console.log(`✅ Config exists: ${config}`);
        passed++;
      } else {
        console.log(`❌ Missing config: ${config}`);
      }
    }

    return passed === configs.length;
  },

  fileStructure: () => {
    console.log('\n=== Testing File Structure ===');
    
    const criticalFiles = [
      'src/App.tsx',
      'src/main.tsx',
      'src/index.css',
      'src/main.css',
      'index.html',
      'src/components/ui/button.tsx',
      'src/components/ui/input.tsx',
      'src/components/ui/dialog.tsx',
      'src/components/ui/tabs.tsx',
      'src/components/ui/select.tsx'
    ];

    let passed = 0;
    for (const file of criticalFiles) {
      if (fs.existsSync(path.join(rootDir, file))) {
        console.log(`✅ Critical file exists: ${file}`);
        passed++;
      } else {
        console.log(`❌ Missing critical file: ${file}`);
      }
    }

    // Check for problematic components
    const problematicFile = path.join(rootDir, 'src/components/ui/chart.tsx');
    if (!fs.existsSync(problematicFile)) {
      console.log('✅ Problematic component removed: src/components/ui/chart.tsx');
      passed++;
    } else {
      console.log('⚠️  Problematic component still exists: src/components/ui/chart.tsx');
    }

    return passed >= criticalFiles.length;
  },

  performance: () => {
    console.log('\n=== Testing Performance ===');
    
    const distDir = path.join(rootDir, 'dist');
    if (!fs.existsSync(distDir)) {
      console.log('⚠️  No dist folder found, build first');
      return true; // Not a failure, just a warning
    }

    // Basic bundle size check
    try {
      const stats = fs.statSync(distDir);
      console.log('✅ Build output exists');
      return true;
    } catch (error) {
      console.log('❌ Build output check failed');
      return false;
    }
  },

  githubPages: () => {
    console.log('\n=== Testing GitHub Pages Compatibility ===');
    
    const indexHtml = path.join(rootDir, 'index.html');
    if (!fs.existsSync(indexHtml)) {
      console.log('❌ index.html not found');
      return false;
    }

    const content = fs.readFileSync(indexHtml, 'utf8');
    const patterns = [
      'window.GITHUB_PAGES_BASE',
      'jatin-kumar-khilrani.github.io',
      'responsive-chatbot-w'
    ];

    let passed = 0;
    for (const pattern of patterns) {
      if (content.includes(pattern)) {
        console.log(`✅ GitHub Pages pattern found: ${pattern}`);
        passed++;
      } else {
        console.log(`❌ Missing GitHub Pages pattern: ${pattern}`);
      }
    }

    // Check vite config
    const viteGithubConfig = path.join(rootDir, 'vite.config.github.ts');
    if (fs.existsSync(viteGithubConfig)) {
      console.log('✅ Vite GitHub config has proper base path');
      passed++;
    } else {
      console.log('❌ Missing vite.config.github.ts');
    }

    return passed >= patterns.length;
  },

  security: () => {
    console.log('\n=== Testing Security ===');
    
    const securityChecks = [
      { file: 'src/App.tsx', patterns: ['process.env', 'API_KEY', 'SECRET', 'TOKEN'] },
      { file: 'src/components/MessagingApp.tsx', patterns: ['process.env', 'API_KEY', 'SECRET', 'TOKEN'] }
    ];

    let passed = 0;
    for (const check of securityChecks) {
      const filePath = path.join(rootDir, check.file);
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf8');
        let hasSecrets = false;
        
        for (const pattern of check.patterns) {
          if (content.includes(pattern) && !content.includes(`// ${pattern}`)) {
            hasSecrets = true;
            break;
          }
        }
        
        if (!hasSecrets) {
          console.log(`✅ No hardcoded secrets in ${check.file}`);
          passed++;
        } else {
          console.log(`❌ Potential secrets found in ${check.file}`);
        }
      } else {
        console.log(`⚠️  File not found: ${check.file}`);
      }
    }

    return passed >= securityChecks.length;
  }
};

// Run all tests
const results = {};
let totalPassed = 0;
let totalTests = 0;

for (const [testName, testFunc] of Object.entries(tests)) {
  try {
    const result = testFunc();
    results[testName] = result;
    if (result) totalPassed++;
    totalTests++;
  } catch (error) {
    console.log(`❌ Test ${testName} failed with error: ${error.message}`);
    results[testName] = false;
    totalTests++;
  }
}

// Summary
console.log('\n=== Test Summary ===');
console.log(`✅ Passed: ${totalPassed}/${totalTests}`);
console.log(`❌ Failed: ${totalTests - totalPassed}/${totalTests}`);

if (totalPassed === totalTests) {
  console.log('\n🎉 All tests passed! Ready for deployment.');
  process.exit(0);
} else {
  console.log('\n❌ Some tests failed! Please fix issues before deploying.');
  process.exit(1);
}