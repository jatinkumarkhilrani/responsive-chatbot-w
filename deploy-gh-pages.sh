#!/bin/bash

# GitHub Pages Deployment Script for Sahaay AI Messaging
set -e

echo "🚀 Starting GitHub Pages deployment..."

# Clean previous builds
rm -rf dist

# Set environment for GitHub Pages
export GITHUB_PAGES=true
export NODE_ENV=production

echo "📦 Installing dependencies..."
npm install --legacy-peer-deps

echo "🔨 Building for GitHub Pages..."
npm run build:github

echo "📁 Preparing dist directory..."
# Copy additional files needed for GitHub Pages
cp public/404.html dist/
cp public/.nojekyll dist/ 2>/dev/null || echo "<!-- GitHub Pages -->" > dist/.nojekyll

echo "✅ Build complete! Ready for deployment."
echo "📂 Files in dist directory:"
ls -la dist/

echo ""
echo "🌐 To deploy manually, run:"
echo "  gh-pages -d dist"
echo ""
echo "💡 Or commit and push to trigger automatic deployment via GitHub Actions."