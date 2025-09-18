#!/bin/bash

# Build and deploy script for GitHub Pages
set -e

echo "🚀 Starting build for GitHub Pages..."

# Set environment for GitHub Pages
export GITHUB_PAGES=true

# Clean previous build
if [ -d "dist" ]; then
  rm -rf dist
  echo "✅ Cleaned previous build"
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm ci

# Type check
echo "🔍 Running type check..."
npm run type-check

# Build project
echo "🔨 Building project..."
npm run build:github

# Verify build
if [ ! -d "dist" ]; then
  echo "❌ Build failed - dist directory not found"
  exit 1
fi

if [ ! -f "dist/index.html" ]; then
  echo "❌ Build failed - index.html not found"
  exit 1
fi

echo "✅ Build successful!"

# Deploy to gh-pages branch
echo "🚀 Deploying to GitHub Pages..."
npm run deploy

echo "🎉 Deployment complete!"
echo "Your site will be available at: https://username.github.io/sahaay-ai-messaging/"