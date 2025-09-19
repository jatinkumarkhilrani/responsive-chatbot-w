#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const projectRoot = process.cwd();

console.log('🔧 Manual Build Test');
console.log('Project Root:', projectRoot);

// 1. Check if React is properly installed
try {
  const reactPath = path.join(projectRoot, 'node_modules', 'react', 'package.json');
  if (fs.existsSync(reactPath)) {
    const reactPkg = JSON.parse(fs.readFileSync(reactPath, 'utf8'));
    console.log('✅ React version:', reactPkg.version);
  } else {
    console.log('❌ React not found in node_modules');
  }
} catch (error) {
  console.log('❌ Error checking React:', error.message);
}

// 2. Check TypeScript compilation
try {
  console.log('\n🔧 Running TypeScript check...');
  const typeResult = execSync('npx tsc --noEmit', { 
    cwd: projectRoot, 
    encoding: 'utf8',
    stdio: 'pipe'
  });
  console.log('✅ TypeScript check passed');
} catch (error) {
  console.log('❌ TypeScript errors:');
  console.log(error.stdout || error.stderr);
}

// 3. Test React imports
try {
  console.log('\n🔧 Testing React imports...');
  const testFile = `
import { memo, useCallback, useState, useMemo } from 'react';
console.log('React hooks imported successfully');
export default function TestComponent() {
  const [state, setState] = useState(null);
  const callback = useCallback(() => {}, []);
  return memo(() => null);
}
`;
  fs.writeFileSync(path.join(projectRoot, 'test-react.tsx'), testFile);
  
  // Try to compile this test file
  execSync('npx tsc --noEmit test-react.tsx', { 
    cwd: projectRoot,
    stdio: 'pipe'
  });
  
  console.log('✅ React imports work correctly');
  fs.unlinkSync(path.join(projectRoot, 'test-react.tsx'));
} catch (error) {
  console.log('❌ React import test failed:');
  console.log(error.stdout || error.stderr);
  // Clean up test file
  const testPath = path.join(projectRoot, 'test-react.tsx');
  if (fs.existsSync(testPath)) {
    fs.unlinkSync(testPath);
  }
}

// 4. Test Vite build
try {
  console.log('\n🔧 Testing Vite build...');
  const buildResult = execSync('npx vite build --mode development', { 
    cwd: projectRoot, 
    encoding: 'utf8',
    stdio: 'pipe'
  });
  console.log('✅ Vite build succeeded');
} catch (error) {
  console.log('❌ Vite build failed:');
  console.log(error.stdout || error.stderr);
}

console.log('\n🏁 Build test complete');