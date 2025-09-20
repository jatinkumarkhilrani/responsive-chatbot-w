#!/usr/bin/env bash

# Performance Test Script
echo "⚡ Performance Validation Test"
echo "============================="

# Test 1: Check for performance-killing imports
echo ""
echo "🔍 Checking for performance issues..."

PERF_KILLERS=(
  "\"react-chartjs-2\""
  "\"chart.js\"" 
  "\"moment\""
  "\"lodash\""
  "\"@babel\""
)

for killer in "${PERF_KILLERS[@]}"; do
  if grep -r "$killer" src/ package.json &>/dev/null; then
    echo "❌ Performance killer found: $killer"
    exit 1
  else
    echo "✅ No $killer imports"
  fi
done

# Test 2: Check bundle optimization
echo ""
echo "📦 Checking bundle optimization..."

if grep -q "manualChunks" vite.config.github.ts; then
  echo "✅ Manual chunks configured"
else
  echo "❌ Missing manual chunks optimization"
  exit 1
fi

if grep -q "treeshaking" vite.config.*.ts || grep -q "rollupOptions" vite.config.*.ts; then
  echo "✅ Tree shaking configured"
else
  echo "❌ Missing tree shaking optimization"
  exit 1
fi

# Test 3: Check for lazy loading
echo ""
echo "🚀 Checking lazy loading patterns..."

if grep -r "lazy\|Suspense" src/ &>/dev/null; then
  echo "✅ Lazy loading implemented"
else
  echo "⚠️  No lazy loading detected (optional)"
fi

# Test 4: Check memory management
echo ""
echo "🧠 Checking memory management..."

if grep -r "useCallback\|useMemo\|memo" src/ &>/dev/null; then
  echo "✅ React optimization hooks used"
else
  echo "❌ Missing React optimization hooks"
  exit 1
fi

# Test 5: Check for infinite loops prevention
echo ""
echo "🔄 Checking for loop prevention..."

if grep -r "useEffect.*\[\]" src/ &>/dev/null; then
  echo "✅ Empty dependency arrays found (good)"
else
  echo "⚠️  No empty dependency arrays (might be okay)"
fi

# Test 6: Check asset optimization
echo ""
echo "🖼️  Checking asset optimization..."

if grep -q "assetsDir" vite.config.*.ts; then
  echo "✅ Asset directory configured"
else
  echo "❌ Missing asset optimization"
  exit 1
fi

# Test 7: Check for proper error boundaries
echo ""
echo "⚠️  Checking error boundaries..."

if grep -r "ErrorBoundary\|error.*boundary" src/ &>/dev/null; then
  echo "✅ Error boundaries implemented"
else
  echo "❌ Missing error boundaries"
  exit 1
fi

echo ""
echo "✅ Performance validation completed!"
echo "🚀 Application optimized for performance"