#!/bin/bash

# Comprehensive Package Lock Fix Script
echo "🔧 Fixing package-lock.json sync issues..."

# Remove old lock file and node_modules to ensure clean install
echo "Cleaning old dependencies..."
rm -rf node_modules package-lock.json

# Install with legacy peer deps to handle compatibility issues
echo "Installing dependencies with legacy peer deps..."
npm install --legacy-peer-deps

# Install any missing TypeScript types
echo "Installing additional type definitions..."
npm install --save-dev @types/uuid @types/d3 @types/three

# Verify critical packages are installed
echo "Verifying critical packages..."
npm list @github/spark zustand date-fns react react-dom --depth=0

# Run audit fix for security issues
echo "Fixing security vulnerabilities..."
npm audit fix --legacy-peer-deps

echo "✅ Package dependencies fixed!"
echo "Running basic validation..."

# Basic validation
if npm run test:types; then
    echo "✅ TypeScript validation passed"
else
    echo "❌ TypeScript validation failed"
    exit 1
fi

echo "🎉 All package issues resolved!"