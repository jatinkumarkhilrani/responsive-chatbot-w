#!/bin/bash

# Comprehensive Test Runner Script
# This script runs all tests and reports results

echo "🧪 Running Comprehensive Test Infrastructure"
echo "=============================================="

# Check if Node.js is available
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install Node.js to run tests."
    exit 1
fi

# Run the comprehensive test
echo "📋 Executing comprehensive tests..."
cd "$(dirname "$0")"
node scripts/test-comprehensive.js

# Capture exit code
EXIT_CODE=$?

if [ $EXIT_CODE -eq 0 ]; then
    echo ""
    echo "✅ All tests passed! Ready for deployment."
    echo "📦 You can now run: npm run build:github-pages"
else
    echo ""
    echo "❌ Some tests failed! Please fix issues before deploying."
    echo "📋 Check the output above for specific issues to resolve."
fi

exit $EXIT_CODE