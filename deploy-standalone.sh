#!/bin/bash

# Deploy Sahaay AI Messaging to GitHub Pages
# This script builds and deploys the standalone version

set -e  # Exit on any error

echo "🚀 Starting Sahaay AI Messaging deployment..."

# Clean previous builds
echo "🧹 Cleaning previous builds..."
rm -rf dist/

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build for GitHub Pages
echo "🔨 Building for GitHub Pages..."
GITHUB_PAGES=true npm run build:github

# Verify build exists
if [ ! -d "dist" ]; then
    echo "❌ Build failed - dist directory not found"
    exit 1
fi

# Create .nojekyll file to prevent GitHub Pages from ignoring files starting with _
touch dist/.nojekyll

# Create 404.html for SPA routing support
cat > dist/404.html << 'EOF'
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <title>Sahaay - Privacy-First AI Messaging</title>
    <script type="text/javascript">
      // Single Page Apps for GitHub Pages
      var pathSegmentsToKeep = 1;
      var l = window.location;
      l.replace(
        l.protocol + '//' + l.hostname + (l.port ? ':' + l.port : '') +
        l.pathname.split('/').slice(0, 1 + pathSegmentsToKeep).join('/') + 
        '/?/' + 
        l.pathname.slice(1).split('/').slice(pathSegmentsToKeep).join('/').replace(/&/g, '~and~') +
        (l.search ? '&' + l.search.slice(1).replace(/&/g, '~and~') : '') +
        l.hash
      );
    </script>
  </head>
  <body>
    <div style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
      <h1>Redirecting to Sahaay...</h1>
      <p>If you are not redirected automatically, <a href="/sahaay-ai-messaging/">click here</a>.</p>
    </div>
  </body>
</html>
EOF

echo "✅ Build completed successfully!"
echo "📁 Built files are in the 'dist' directory"
echo "🌐 Ready for GitHub Pages deployment"

# Optional: Deploy using gh-pages if available
if command -v gh-pages &> /dev/null; then
    echo "🚀 Deploying to GitHub Pages..."
    npm run deploy
    echo "✅ Deployment completed!"
else
    echo "ℹ️  To deploy, run: npm run deploy"
    echo "ℹ️  Or manually upload the 'dist' folder to your web server"
fi

echo "🎉 Sahaay AI Messaging is ready!"