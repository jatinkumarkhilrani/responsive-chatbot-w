#!/bin/bash

# Deployment script for Sahaay AI Messaging
# This script builds and deploys the application to GitHub Pages

set -e

echo "🚀 Starting deployment process..."

# Check if gh-pages is installed
if ! command -v gh-pages &> /dev/null; then
    echo "📦 Installing gh-pages..."
    npm install -g gh-pages
fi

# Clean previous builds
echo "🧹 Cleaning previous builds..."
rm -rf dist

# Build for GitHub Pages
echo "🔨 Building for GitHub Pages..."
npm run build:github

# Check if build was successful
if [ ! -d "dist" ]; then
    echo "❌ Build failed - dist directory not found"
    exit 1
fi

echo "✅ Build successful!"

# Deploy to GitHub Pages
echo "🌐 Deploying to GitHub Pages..."
gh-pages -d dist

echo "🎉 Deployment complete!"
echo "📖 Your app will be available at: https://username.github.io/sahaay-ai-messaging/"
echo "⏰ Note: It may take a few minutes for changes to appear"