#!/bin/bash

# GitHub Pages Deployment Script
set -e

echo "🚀 Starting GitHub Pages deployment..."

# Clean previous build
rm -rf dist

# Set environment variables
export GITHUB_PAGES=true
export NODE_ENV=production

# Install dependencies
echo "📦 Installing dependencies..."
npm ci

# Build for GitHub Pages
echo "🏗️ Building application..."
npm run build:github

# Create .nojekyll file
echo "📝 Creating .nojekyll file..."
touch dist/.nojekyll

# Create CNAME if custom domain is needed
# echo "yourdomain.com" > dist/CNAME

echo "✅ Build complete! Files ready in dist/ directory"
echo "📂 Deploy the dist/ directory to GitHub Pages"