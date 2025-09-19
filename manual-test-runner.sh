#!/bin/bash

# Manual Test Runner for Comprehensive Testing
# Addresses all production issues and prevents regression

echo "🚀 Running Manual Test Suite..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test counter
TESTS_PASSED=0
TESTS_FAILED=0

# Function to log results
log_result() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✅ $2${NC}"
        ((TESTS_PASSED++))
    else
        echo -e "${RED}❌ $2${NC}"
        ((TESTS_FAILED++))
    fi
}

# Function to log warnings
log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# Function to log info
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

echo -e "${BLUE}=== Manual Testing Infrastructure ===${NC}"

# Test 1: Check essential files exist
echo -e "\n${BLUE}Testing Essential Files...${NC}"
essential_files=(
    "package.json"
    "src/App.tsx"
    "src/main.tsx"
    "src/index.css"
    "src/main.css"
    "index.html"
    "vite.config.ts"
    "vite.config.github.ts"
    "vite.config.standalone.ts"
    "tsconfig.json"
)

for file in "${essential_files[@]}"; do
    if [ -f "$file" ]; then
        log_result 0 "Essential file exists: $file"
    else
        log_result 1 "Essential file missing: $file"
    fi
done

# Test 2: Check package.json structure
echo -e "\n${BLUE}Testing Package.json Structure...${NC}"
if [ -f "package.json" ]; then
    # Check if it's valid JSON
    if jq . package.json > /dev/null 2>&1; then
        log_result 0 "package.json is valid JSON"
        
        # Check required scripts
        required_scripts=("build" "dev" "build:github-pages" "build:standalone")
        for script in "${required_scripts[@]}"; do
            if jq -e ".scripts.\"$script\"" package.json > /dev/null 2>&1; then
                log_result 0 "Required script exists: $script"
            else
                log_result 1 "Required script missing: $script"
            fi
        done
    else
        log_result 1 "package.json is not valid JSON"
    fi
else
    log_result 1 "package.json does not exist"
fi

# Test 3: Check node_modules
echo -e "\n${BLUE}Testing Dependencies...${NC}"
if [ -d "node_modules" ]; then
    log_result 0 "node_modules directory exists"
    
    # Check size
    size=$(du -sh node_modules | cut -f1)
    log_info "node_modules size: $size"
else
    log_result 1 "node_modules missing - run npm install"
fi

# Test 4: Check UI components
echo -e "\n${BLUE}Testing UI Components...${NC}"
ui_components=(
    "src/components/ui/button.tsx"
    "src/components/ui/input.tsx"
    "src/components/ui/dialog.tsx"
    "src/components/ui/tabs.tsx"
    "src/components/ui/select.tsx"
    "src/components/ui/card.tsx"
)

for component in "${ui_components[@]}"; do
    if [ -f "$component" ]; then
        log_result 0 "UI component exists: $component"
    else
        log_result 1 "UI component missing: $component"
    fi
done

# Test 5: Check main components
echo -e "\n${BLUE}Testing Main Components...${NC}"
main_components=(
    "src/components/MessagingApp.tsx"
    "src/components/ChatList.tsx"
    "src/components/MessageList.tsx"
    "src/components/SettingsDialog.tsx"
)

for component in "${main_components[@]}"; do
    if [ -f "$component" ]; then
        log_result 0 "Main component exists: $component"
    else
        log_result 1 "Main component missing: $component"
    fi
done

# Test 6: Check CSS responsive patterns
echo -e "\n${BLUE}Testing CSS Responsive Patterns...${NC}"
if [ -f "src/index.css" ]; then
    css_patterns=(
        ".messaging-app-container"
        ".sidebar-container"
        ".main-content-area"
        "@media (max-width: 640px)"
        "@media (min-width: 641px)"
        "height: 100vh"
        "height: 100dvh"
    )
    
    for pattern in "${css_patterns[@]}"; do
        if grep -q "$pattern" src/index.css; then
            log_result 0 "CSS pattern found: $pattern"
        else
            log_warning "CSS pattern missing: $pattern"
        fi
    done
else
    log_result 1 "src/index.css not found"
fi

# Test 7: Check for problematic files
echo -e "\n${BLUE}Testing for Problematic Files...${NC}"
problematic_files=(
    "src/components/ui/chart.tsx"
)

for file in "${problematic_files[@]}"; do
    if [ ! -f "$file" ]; then
        log_result 0 "Problematic file removed: $file"
    else
        log_warning "Problematic file still exists: $file"
    fi
done

# Test 8: Check GitHub Pages configuration
echo -e "\n${BLUE}Testing GitHub Pages Configuration...${NC}"
if [ -f "index.html" ]; then
    github_patterns=(
        "window.GITHUB_PAGES_BASE"
        "jatin-kumar-khilrani.github.io"
        "responsive-chatbot-w"
    )
    
    for pattern in "${github_patterns[@]}"; do
        if grep -q "$pattern" index.html; then
            log_result 0 "GitHub Pages pattern found: $pattern"
        else
            log_warning "GitHub Pages pattern missing: $pattern"
        fi
    done
else
    log_result 1 "index.html not found"
fi

# Test 9: Check bundle size (if dist exists)
echo -e "\n${BLUE}Testing Bundle Size...${NC}"
if [ -d "dist" ]; then
    bundle_size=$(du -sh dist | cut -f1)
    log_info "Bundle size: $bundle_size"
    log_result 0 "Bundle exists - size: $bundle_size"
else
    log_warning "No dist folder found - build first"
fi

# Test 10: Security check for hardcoded secrets
echo -e "\n${BLUE}Testing Security...${NC}"
security_files=(
    "src/App.tsx"
    "src/components/MessagingApp.tsx"
)

for file in "${security_files[@]}"; do
    if [ -f "$file" ]; then
        # Check for potential API keys or secrets
        if grep -E "(api[_-]?key|secret|token).*['\"][a-zA-Z0-9]{20,}['\"]" "$file" > /dev/null; then
            log_result 1 "Potential hardcoded secrets in $file"
        else
            log_result 0 "No hardcoded secrets in $file"
        fi
    fi
done

# Summary
echo -e "\n${BLUE}=== Test Summary ===${NC}"
echo -e "${GREEN}✅ Passed: $TESTS_PASSED${NC}"
echo -e "${RED}❌ Failed: $TESTS_FAILED${NC}"

if [ $TESTS_FAILED -gt 0 ]; then
    echo -e "\n${RED}❌ Some tests failed! Please fix issues before deploying.${NC}"
    exit 1
else
    echo -e "\n${GREEN}✅ All tests passed! Ready for deployment.${NC}"
    exit 0
fi