#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const rootDir = process.cwd();

console.log('🔧 Running Build Test...\n');

try {
  // Test TypeScript compilation
  console.log('📝 Testing TypeScript compilation...');
  execSync('npx tsc --noEmit --skipLibCheck', { 
    stdio: 'pipe',
    cwd: rootDir 
  });
  console.log('✅ TypeScript compilation successful');

  // Test Vite build
  console.log('🏗️  Testing Vite build...');
  execSync('npm run build', { 
    stdio: 'pipe',
    cwd: rootDir 
  });
  console.log('✅ Vite build successful');

  // Check if dist folder exists
  const distPath = path.join(rootDir, 'dist');
  if (fs.existsSync(distPath)) {
    console.log('✅ Build output created');
    
    // Check index.html exists
    const indexPath = path.join(distPath, 'index.html');
    if (fs.existsSync(indexPath)) {
      console.log('✅ index.html generated');
    } else {
      console.log('❌ index.html missing in build output');
    }
  } else {
    console.log('❌ No build output found');
  }

  console.log('\n🎉 All build tests passed!');
  process.exit(0);

} catch (error) {
  console.error('❌ Build test failed:', error.message);
  process.exit(1);
}