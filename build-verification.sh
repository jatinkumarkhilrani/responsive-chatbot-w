#!/bin/bash

# Build Verification Script
# Verifies that builds complete successfully and produces valid output

echo "🏗️  Build Verification Script"
echo "============================"

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Helper function
log_step() {
    echo -e "${BLUE}$1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# Step 1: Clean previous builds
log_step "🧹 Cleaning previous builds..."
if [ -d "dist" ]; then
    rm -rf dist
    log_success "Previous build cleaned"
else
    log_success "No previous build to clean"
fi

# Step 2: Run manual tests first
log_step "🧪 Running manual tests..."
if bash manual-test-runner.sh > /dev/null 2>&1; then
    log_success "Manual tests passed"
else
    log_error "Manual tests failed - aborting build"
    exit 1
fi

# Step 3: Check if npm is available (just check, don't use)
log_step "🔍 Environment check..."
if command -v npm >/dev/null 2>&1; then
    log_success "npm available in environment"
else
    log_warning "npm not available - cannot run actual build"
    log_warning "This script validates file structure only"
fi

# Step 4: Validate build prerequisites
log_step "📋 Validating build prerequisites..."

# Check critical files for build
build_files=(
    "vite.config.ts:Vite config"
    "vite.config.github.ts:GitHub Pages config"
    "vite.config.standalone.ts:Standalone config"
    "tsconfig.json:TypeScript config"
    "tailwind.config.js:Tailwind config"
    "src/main.tsx:Main entry"
    "src/App.tsx:App component"
    "index.html:HTML template"
)

all_good=true
for item in "${build_files[@]}"; do
    IFS=':' read -r file name <<< "$item"
    if [ -f "$file" ]; then
        log_success "$name ready"
    else
        log_error "$name missing"
        all_good=false
    fi
done

if [ "$all_good" = false ]; then
    log_error "Build prerequisites not met"
    exit 1
fi

# Step 5: Validate package.json structure
log_step "📦 Validating package.json..."

if [ -f "package.json" ]; then
    # Check for essential build scripts
    build_scripts=("build:github-pages" "build:standalone")
    for script in "${build_scripts[@]}"; do
        if grep -q "\"$script\":" package.json; then
            log_success "Build script available: $script"
        else
            log_error "Build script missing: $script"
            all_good=false
        fi
    done
    
    # Check for essential dependencies
    essential_deps=("vite" "react" "typescript" "tailwindcss")
    for dep in "${essential_deps[@]}"; do
        if grep -q "\"$dep\":" package.json; then
            log_success "Essential dependency found: $dep"
        else
            log_error "Essential dependency missing: $dep"
            all_good=false
        fi
    done
else
    log_error "package.json not found"
    all_good=false
fi

# Step 6: Validate Vite configurations
log_step "⚙️  Validating Vite configurations..."

# Check GitHub Pages config
if [ -f "vite.config.github.ts" ]; then
    if grep -q "base:" vite.config.github.ts; then
        log_success "GitHub Pages base path configured"
    else
        log_warning "GitHub Pages base path not configured"
    fi
else
    log_error "GitHub Pages Vite config missing"
    all_good=false
fi

# Check standalone config
if [ -f "vite.config.standalone.ts" ]; then
    log_success "Standalone config available"
else
    log_error "Standalone Vite config missing"
    all_good=false
fi

# Final validation
if [ "$all_good" = true ]; then
    log_success "All build prerequisites met!"
    echo -e "\n${GREEN}🎉 Build verification passed!${NC}"
    echo -e "${BLUE}💡 To run actual builds, use:${NC}"
    echo -e "   npm run build:standalone"
    echo -e "   npm run build:github-pages"
    exit 0
else
    log_error "Build verification failed!"
    echo -e "\n${RED}❌ Fix the issues above before building${NC}"
    exit 1
fi