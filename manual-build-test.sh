#!/bin/bash

# Manual Build Test Script
echo "🧪 Running Manual Build Tests..."

# Check if package.json is in sync
echo "📦 Checking package.json sync..."
if ! npm list --depth=0 > /dev/null 2>&1; then
    echo "❌ Dependencies out of sync - run npm install"
    exit 1
fi
echo "✅ Dependencies synced"

# Test TypeScript compilation
echo "🔧 Testing TypeScript compilation..."
npx tsc --noEmit
if [ $? -ne 0 ]; then
    echo "❌ TypeScript compilation failed"
    exit 1
fi
echo "✅ TypeScript compilation passed"

# Test builds
echo "🏗️  Testing builds..."

# GitHub Pages build
echo "Building for GitHub Pages..."
npm run build:github-pages
if [ $? -ne 0 ]; then
    echo "❌ GitHub Pages build failed"
    exit 1
fi
echo "✅ GitHub Pages build successful"

# Standalone build  
echo "Building standalone..."
npm run build:standalone
if [ $? -ne 0 ]; then
    echo "❌ Standalone build failed"
    exit 1
fi
echo "✅ Standalone build successful"

echo "🎉 All manual tests passed!"