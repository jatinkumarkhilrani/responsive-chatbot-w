#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

const rootDir = process.cwd();

console.log('📦 Analyzing Bundle Size...\n');

const distDir = path.join(rootDir, 'dist');

if (!fs.existsSync(distDir)) {
  console.log('❌ No dist folder found. Run build first.');
  process.exit(1);
}

function getDirectorySize(dirPath) {
  let totalSize = 0;
  
  try {
    const files = fs.readdirSync(dirPath);
    
    for (const file of files) {
      const filePath = path.join(dirPath, file);
      const stats = fs.statSync(filePath);
      
      if (stats.isDirectory()) {
        totalSize += getDirectorySize(filePath);
      } else {
        totalSize += stats.size;
      }
    }
  } catch (error) {
    console.log(`Error reading directory ${dirPath}: ${error.message}`);
  }
  
  return totalSize;
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

const totalSize = getDirectorySize(distDir);

console.log(`📊 Build Output Analysis:`);
console.log(`   Total Size: ${formatBytes(totalSize)}`);

// Performance thresholds
const WARNING_SIZE = 5 * 1024 * 1024; // 5MB
const ERROR_SIZE = 10 * 1024 * 1024; // 10MB

if (totalSize > ERROR_SIZE) {
  console.log('🚨 Bundle size is very large! Consider optimization.');
  process.exit(1);
} else if (totalSize > WARNING_SIZE) {
  console.log('⚠️  Bundle size is getting large. Consider optimization.');
} else {
  console.log('✅ Bundle size is reasonable.');
}

console.log('\n📁 File breakdown:');
try {
  const files = fs.readdirSync(distDir);
  for (const file of files) {
    const filePath = path.join(distDir, file);
    const stats = fs.statSync(filePath);
    
    if (stats.isFile()) {
      console.log(`   ${file}: ${formatBytes(stats.size)}`);
    } else if (stats.isDirectory()) {
      const dirSize = getDirectorySize(filePath);
      console.log(`   ${file}/: ${formatBytes(dirSize)}`);
    }
  }
} catch (error) {
  console.log(`Error listing files: ${error.message}`);
}

console.log('\n✅ Bundle analysis complete.');