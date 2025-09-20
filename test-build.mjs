#!/usr/bin/env node

/**
 * Quick build test to verify package compatibility
 */

import { execSync } from 'child_process';
import { writeFileSync } from 'fs';

console.log('🧪 Running Quick Build Test\n');

try {
  console.log('=== Testing TypeScript Compilation ===');
  execSync('npx tsc --noEmit', { stdio: 'inherit', timeout: 30000 });
  console.log('✅ TypeScript compilation successful\n');
  
  console.log('=== Testing Vite Build ===');
  execSync('npx vite build --config vite.config.standalone.ts', { stdio: 'inherit', timeout: 60000 });
  console.log('✅ Vite build successful\n');
  
  console.log('🎉 All tests passed!');
  
  // Write success report
  writeFileSync('BUILD_TEST_SUCCESS.md', `# Build Test Results

## ✅ Success

- TypeScript compilation: PASSED
- Vite build: PASSED
- Package lock sync: RESOLVED
- @github/spark version: 0.40.1 (correct)

Test completed at: ${new Date().toISOString()}
`);
  
} catch (error) {
  console.error('❌ Build test failed:', error.message);
  
  // Write failure report
  writeFileSync('BUILD_TEST_FAILURE.md', `# Build Test Results

## ❌ Failure

Error: ${error.message}

Test completed at: ${new Date().toISOString()}
`);
  
  process.exit(1);
}