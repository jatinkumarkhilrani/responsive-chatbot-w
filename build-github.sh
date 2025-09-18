#!/bin/bash

# Build script for GitHub Pages deployment
echo "Starting GitHub Pages build..."

# Set environment variables
export GITHUB_PAGES=true

# Clean previous build
echo "Cleaning previous build..."
rm -rf dist

# Build the application
echo "Building application..."
npx tsc -b && npx vite build --config vite.config.github.ts

# Check if build was successful
if [ $? -ne 0 ]; then
    echo "Build failed!"
    exit 1
fi

# Create GitHub Pages specific files
echo "Creating GitHub Pages files..."

# Create .nojekyll file to disable Jekyll processing
touch dist/.nojekyll

# Copy 404.html for SPA routing
cp dist/index.html dist/404.html

echo "Build completed successfully!"
echo "Files are ready in ./dist directory"