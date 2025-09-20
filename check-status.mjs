#!/usr/bin/env node

/**
 * Basic status check for the project
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

console.log('🔍 Project Status Check\n');

// Check package.json and lock file sync
const packageJson = JSON.parse(fs.readFileSync(path.join(projectRoot, 'package.json'), 'utf8'));
const sparkVersion = packageJson.dependencies['@github/spark'];

console.log('=== Package Information ===');
console.log(`Package name: ${packageJson.name}`);
console.log(`Package version: ${packageJson.version}`);
console.log(`@github/spark required: ${sparkVersion}`);

// Check if node_modules has correct version
const sparkModulePath = path.join(projectRoot, 'node_modules', '@github', 'spark', 'package.json');
if (fs.existsSync(sparkModulePath)) {
  const sparkPackage = JSON.parse(fs.readFileSync(sparkModulePath, 'utf8'));
  console.log(`@github/spark installed: ${sparkPackage.version}`);
  
  if (sparkPackage.version.startsWith('0.40.')) {
    console.log('✅ Correct @github/spark version installed');
  } else {
    console.log('❌ Wrong @github/spark version');
  }
} else {
  console.log('❌ @github/spark not found in node_modules');
}

// Check workspace configuration
console.log('\n=== Workspace Configuration ===');
if (packageJson.workspaces && packageJson.workspaces.packages.length > 0) {
  console.log('❌ Workspaces still configured (should be empty)');
  console.log('Packages:', packageJson.workspaces.packages);
} else {
  console.log('✅ Workspaces correctly disabled');
}

// Check critical files
console.log('\n=== Critical Files ===');
const criticalFiles = [
  'src/App.tsx',
  'src/main.tsx', 
  'src/index.css',
  'vite.config.ts',
  'vite.config.github.ts',
  'vite.config.standalone.ts',
  'tsconfig.json'
];

criticalFiles.forEach(file => {
  if (fs.existsSync(path.join(projectRoot, file))) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} missing`);
  }
});

console.log('\n🎯 Status check complete!');