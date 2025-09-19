#!/usr/bin/env bash

# Manual test execution script
# This script manually checks the critical components

echo "🧪 Manual Comprehensive Test Suite"
echo "=================================="

# Test 1: Check critical files exist
echo ""
echo "📁 Testing File Structure..."

CRITICAL_FILES=(
  "src/App.tsx"
  "src/main.tsx"
  "src/index.css"
  "src/main.css"
  "index.html"
  "package.json"
  "vite.config.ts"
  "vite.config.github.ts"
  "vite.config.standalone.ts"
)

for file in "${CRITICAL_FILES[@]}"; do
  if [ -f "$file" ]; then
    echo "✅ $file exists"
  else
    echo "❌ $file missing"
    exit 1
  fi
done

# Test 2: Check UI components exist
echo ""
echo "🧩 Testing UI Components..."

UI_COMPONENTS=(
  "src/components/ui/button.tsx"
  "src/components/ui/input.tsx"
  "src/components/ui/dialog.tsx"
  "src/components/ui/tabs.tsx"
  "src/components/ui/select.tsx"
)

for component in "${UI_COMPONENTS[@]}"; do
  if [ -f "$component" ]; then
    echo "✅ $component exists"
  else
    echo "❌ $component missing"
    exit 1
  fi
done

# Test 3: Check main components
echo ""
echo "⚛️  Testing Main Components..."

MAIN_COMPONENTS=(
  "src/components/MessagingApp.tsx"
  "src/components/ChatList.tsx"
  "src/components/MessageList.tsx"
  "src/components/SettingsDialog.tsx"
  "src/store/appStore.ts"
  "src/hooks/useKV.ts"
  "src/utils/kvStorage.ts"
)

for component in "${MAIN_COMPONENTS[@]}"; do
  if [ -f "$component" ]; then
    echo "✅ $component exists"
  else
    echo "❌ $component missing"
    exit 1
  fi
done

# Test 4: Check CSS structure
echo ""
echo "🎨 Testing CSS Structure..."

if grep -q "@theme inline" src/main.css; then
  echo "✅ Main CSS has @theme inline"
else
  echo "❌ Main CSS missing @theme inline"
  exit 1
fi

if grep -q "\-\-spacing\-" src/main.css; then
  echo "✅ Main CSS has spacing system"
else
  echo "❌ Main CSS missing spacing system"
  exit 1
fi

if grep -q "100vh" src/index.css; then
  echo "✅ Index CSS has viewport height"
else
  echo "❌ Index CSS missing viewport height"
  exit 1
fi

# Test 5: Check package.json scripts
echo ""
echo "📦 Testing Package Scripts..."

REQUIRED_SCRIPTS=(
  "build:github-pages"
  "build:standalone"
  "test:ci"
)

for script in "${REQUIRED_SCRIPTS[@]}"; do
  if grep -q "\"$script\":" package.json; then
    echo "✅ Script exists: $script"
  else
    echo "❌ Script missing: $script"
    exit 1
  fi
done

# Test 6: Check GitHub Pages config
echo ""
echo "🔧 Testing GitHub Pages Config..."

if grep -q "/responsive-chatbot-w/" vite.config.github.ts; then
  echo "✅ GitHub Pages base path configured"
else
  echo "❌ GitHub Pages base path missing"
  exit 1
fi

if grep -q "jatin-kumar-khilrani.github.io" index.html; then
  echo "✅ GitHub Pages domain configured"
else
  echo "❌ GitHub Pages domain missing"
  exit 1
fi

# Test 7: Check for problematic imports
echo ""
echo "🔍 Testing for Problematic Imports..."

if grep -r "react-chartjs-2" src/ &>/dev/null; then
  echo "❌ Found problematic react-chartjs-2 import"
  exit 1
else
  echo "✅ No problematic react-chartjs-2 imports"
fi

if grep -r "chart.js" src/ &>/dev/null; then
  echo "❌ Found problematic chart.js import"
  exit 1
else
  echo "✅ No problematic chart.js imports"
fi

echo ""
echo "✅ All manual tests passed!"
echo "Ready for build and deployment."