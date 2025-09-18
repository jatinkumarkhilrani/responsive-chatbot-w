#!/bin/bash

set -e  # Exit on any error

echo "🚀 Starting GitHub Pages deployment for Sahaay..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the project root."
    exit 1
fi

echo "📦 Installing/updating dependencies..."
npm install

echo "🔨 Building for GitHub Pages..."
export GITHUB_PAGES=true
npm run build -- --base=/responsive-chatbot-w/

if [ $? -ne 0 ]; then
    echo "❌ Build failed!"
    exit 1
fi

echo "📝 Setting up GitHub Pages files..."

# Create .nojekyll file to prevent Jekyll processing
touch dist/.nojekyll

# Copy 404.html for SPA routing if it doesn't exist
if [ ! -f "dist/404.html" ]; then
    cp dist/index.html dist/404.html
fi

echo "✅ Build completed successfully!"
echo "📁 Build output is in the 'dist' directory"
echo ""
echo "🚢 To deploy to GitHub Pages, run:"
echo "   npx gh-pages -d dist"
echo ""
echo "🌐 Your app will be available at:"
echo "   https://jatin-kumar-khilrani.github.io/responsive-chatbot-w/"