#!/bin/bash

# GitHub Pages Build and Deploy Script
set -e

echo "Building for GitHub Pages..."

# Clean up previous build
rm -rf dist

# Use GitHub Pages specific config
echo "Building with GitHub Pages configuration..."
npx vite build --config vite.config.github.ts

# Create necessary files for GitHub Pages
echo "Setting up GitHub Pages files..."

# Create .nojekyll to prevent Jekyll processing
touch dist/.nojekyll

# Create 404.html for SPA routing
cp dist/index.html dist/404.html

# Update package.json scripts if needed
echo "Build complete. Files ready for GitHub Pages deployment."
echo "Files in dist directory:"
ls -la dist/

echo ""
echo "To deploy manually:"
echo "1. Push the dist folder contents to gh-pages branch"
echo "2. Or use: npx gh-pages -d dist"