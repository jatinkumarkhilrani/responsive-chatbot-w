#!/bin/bash

# Manual Test Runner for Comprehensive Checks
# Runs all critical tests manually

echo "🧪 Manual Comprehensive Test Runner"
echo "===================================="

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test counters
PASSED=0
FAILED=0

# Helper function for logging
log_test() {
    local status="$1"
    local message="$2"
    if [ "$status" = "PASS" ]; then
        echo -e "${GREEN}✅ $message${NC}"
        ((PASSED++))
    elif [ "$status" = "FAIL" ]; then
        echo -e "${RED}❌ $message${NC}"
        ((FAILED++))
    elif [ "$status" = "WARN" ]; then
        echo -e "${YELLOW}⚠️  $message${NC}"
    else
        echo -e "${BLUE}ℹ️  $message${NC}"
    fi
}

# Test 1: Check critical files exist
echo -e "\n${BLUE}=== File Structure Tests ===${NC}"

files=(
    "src/App.tsx:App component"
    "src/main.tsx:Main entry point"
    "src/index.css:Index styles"
    "src/main.css:Main styles"
    "index.html:HTML entry"
    "package.json:Package config"
    "vite.config.github.ts:GitHub Vite config"
    "src/components/ui/chart.tsx:Chart component"
)

for item in "${files[@]}"; do
    IFS=':' read -r file name <<< "$item"
    if [ -f "$file" ]; then
        log_test "PASS" "$name exists"
    else
        log_test "FAIL" "$name missing"
    fi
done

# Test 2: Check React 19 compatibility
echo -e "\n${BLUE}=== React 19 Compatibility ===${NC}"

if [ -f "src/App.tsx" ]; then
    if grep -q "import React," src/App.tsx; then
        log_test "FAIL" "React 19 incompatible imports in App.tsx"
    else
        log_test "PASS" "React 19 compatible imports in App.tsx"
    fi
fi

if [ -f "src/components/MessagingApp.tsx" ]; then
    if grep -q "import React," src/components/MessagingApp.tsx; then
        log_test "FAIL" "React 19 incompatible imports in MessagingApp.tsx"
    else
        log_test "PASS" "React 19 compatible imports in MessagingApp.tsx"
    fi
fi

# Test 3: Check package.json scripts
echo -e "\n${BLUE}=== Package Scripts ===${NC}"

if [ -f "package.json" ]; then
    scripts=("build:github-pages" "build:standalone" "test:types")
    for script in "${scripts[@]}"; do
        if grep -q "\"$script\":" package.json; then
            log_test "PASS" "Script exists: $script"
        else
            log_test "FAIL" "Script missing: $script"
        fi
    done
else
    log_test "FAIL" "package.json not found"
fi

# Test 4: Check CSS structure
echo -e "\n${BLUE}=== CSS Structure ===${NC}"

if [ -f "src/main.css" ]; then
    if grep -q "@theme inline" src/main.css && grep -q -- "--spacing-" src/main.css; then
        log_test "PASS" "Main CSS has proper theme structure"
    else
        log_test "FAIL" "Main CSS missing theme structure"
    fi
else
    log_test "FAIL" "src/main.css not found"
fi

if [ -f "src/index.css" ]; then
    if grep -q "@theme" src/index.css; then
        log_test "PASS" "Index CSS has theme configuration"
    else
        log_test "WARN" "Index CSS missing theme configuration"
    fi
else
    log_test "FAIL" "src/index.css not found"
fi

# Test 5: Check for proper responsive patterns
echo -e "\n${BLUE}=== Responsive Design ===${NC}"

if [ -f "src/index.css" ]; then
    patterns=("@media (max-width: 640px)" "@media (min-width: 641px)" ".messaging-app-container")
    for pattern in "${patterns[@]}"; do
        if grep -q "$pattern" src/index.css; then
            log_test "PASS" "Responsive pattern found: $pattern"
        else
            log_test "WARN" "Responsive pattern missing: $pattern"
        fi
    done
else
    log_test "FAIL" "src/index.css not found"
fi

# Test 6: Check TypeScript compatibility
echo -e "\n${BLUE}=== TypeScript Configuration ===${NC}"

if [ -f "tsconfig.json" ]; then
    log_test "PASS" "TypeScript config exists"
else
    log_test "FAIL" "TypeScript config missing"
fi

# Test 7: Check for problematic dependencies
echo -e "\n${BLUE}=== Dependency Check ===${NC}"

if [ -f "package.json" ]; then
    # Check if recharts is available (needed for chart component)
    if grep -q "\"recharts\":" package.json; then
        log_test "PASS" "Recharts dependency available"
    else
        log_test "WARN" "Recharts dependency missing"
    fi
    
    # Check if React 19 is installed
    if grep -q "\"react\": \".*19" package.json; then
        log_test "PASS" "React 19 installed"
    else
        log_test "WARN" "React 19 not detected"
    fi
fi

# Test 8: Check GitHub Pages configuration
echo -e "\n${BLUE}=== GitHub Pages Configuration ===${NC}"

if [ -f "index.html" ]; then
    patterns=("window.GITHUB_PAGES_BASE" "jatin-kumar-khilrani.github.io" "responsive-chatbot-w")
    for pattern in "${patterns[@]}"; do
        if grep -q "$pattern" index.html; then
            log_test "PASS" "GitHub Pages pattern found: $pattern"
        else
            log_test "WARN" "GitHub Pages pattern missing: $pattern"
        fi
    done
fi

if [ -f "vite.config.github.ts" ]; then
    if grep -q "base:" vite.config.github.ts && grep -q "/responsive-chatbot-w/" vite.config.github.ts; then
        log_test "PASS" "Vite GitHub config has proper base path"
    else
        log_test "FAIL" "Vite GitHub config missing proper base path"
    fi
fi

# Summary
echo -e "\n${BLUE}=== Test Summary ===${NC}"
TOTAL=$((PASSED + FAILED))

echo -e "${GREEN}✅ Passed: $PASSED/$TOTAL${NC}"
if [ $FAILED -gt 0 ]; then
    echo -e "${RED}❌ Failed: $FAILED/$TOTAL${NC}"
    echo -e "\n${RED}❌ Some tests failed! Please fix issues before deploying.${NC}"
    exit 1
else
    echo -e "${RED}❌ Failed: $FAILED/$TOTAL${NC}"
    echo -e "\n${GREEN}🎉 All tests passed! Ready for deployment.${NC}"
    exit 0
fi