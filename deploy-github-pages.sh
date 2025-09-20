#!/bin/bash

# GitHub Pages deployment script for Sahaay AI Messaging

echo "🚀 Starting GitHub Pages deployment for Sahaay..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the project root."
    exit 1
fi

# Check if gh-pages is installed
if ! npm list gh-pages > /dev/null 2>&1; then
    echo "📦 Installing gh-pages..."
    npm install --save-dev gh-pages
fi

# Clean previous build
echo "🧹 Cleaning previous build..."
rm -rf dist

# Build for GitHub Pages
echo "🔨 Building for GitHub Pages..."
export GITHUB_PAGES=true
npm run build:github

if [ $? -ne 0 ]; then
    echo "❌ Build failed!"
    exit 1
fi

# Create CNAME file if needed (uncomment and modify if you have a custom domain)
# echo "yourdomain.com" > dist/CNAME

# Create .nojekyll file to prevent Jekyll processing
echo "📝 Creating .nojekyll file..."
touch dist/.nojekyll

# Add 404.html for SPA routing
echo "📄 Creating 404.html for SPA routing..."
cp dist/index.html dist/404.html

# Deploy to GitHub Pages
echo "🚢 Deploying to GitHub Pages..."
npm run deploy

if [ $? -eq 0 ]; then
    echo "✅ Deployment successful!"
    echo "🌐 Your app should be available at: https://jatin-kumar-khilrani.github.io/responsive-chatbot-w/"
    echo ""
    echo "📝 Note: It may take a few minutes for GitHub Pages to update."
    echo "💡 If you encounter issues, check the GitHub Pages settings in your repository."
else
    echo "❌ Deployment failed!"
    exit 1
fi