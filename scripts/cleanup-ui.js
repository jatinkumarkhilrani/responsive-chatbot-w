#!/usr/bin/env node

/**
 * Clean up UI components script
 * Removes UI components that depend on missing packages
 */

const fs = require('fs');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..');
const uiDir = path.resolve(projectRoot, 'src/components/ui');

// Keep only these essential components
const essentialComponents = [
  'button.tsx',
  'input.tsx',
  'label.tsx',
  'dialog.tsx',
  'tabs.tsx',
  'switch.tsx',
  'select.tsx',
  'dropdown-menu.tsx',
  'card.tsx',
  'badge.tsx',
  'alert.tsx',
  'skeleton.tsx',
  'textarea.tsx'
];

// Components that require external dependencies we don't have
const problematicComponents = [
  'accordion.tsx',
  'alert-dialog.tsx',
  'aspect-ratio.tsx',
  'avatar.tsx',
  'breadcrumb.tsx',
  'calendar.tsx',
  'carousel.tsx',
  'chart.tsx',
  'checkbox.tsx',
  'collapsible.tsx',
  'command.tsx',
  'context-menu.tsx',
  'drawer.tsx',
  'form.tsx',
  'hover-card.tsx',
  'input-otp.tsx',
  'menubar.tsx',
  'navigation-menu.tsx',
  'pagination.tsx',
  'popover.tsx',
  'progress.tsx',
  'radio-group.tsx',
  'resizable.tsx',
  'scroll-area.tsx',
  'separator.tsx',
  'sheet.tsx',
  'sidebar.tsx',
  'slider.tsx',
  'sonner.tsx',
  'toggle-group.tsx',
  'toggle.tsx',
  'tooltip.tsx'
];

console.log('🧹 Cleaning up UI components...');

if (!fs.existsSync(uiDir)) {
  console.log('❌ UI directory not found');
  process.exit(1);
}

let removedCount = 0;
let keptCount = 0;

// Remove problematic components
for (const component of problematicComponents) {
  const componentPath = path.join(uiDir, component);
  if (fs.existsSync(componentPath)) {
    try {
      fs.unlinkSync(componentPath);
      console.log(`🗑️  Removed: ${component}`);
      removedCount++;
    } catch (error) {
      console.error(`❌ Failed to remove ${component}:`, error.message);
    }
  }
}

// Check what's left
const remainingFiles = fs.readdirSync(uiDir).filter(file => file.endsWith('.tsx'));
keptCount = remainingFiles.length;

console.log(`\n✅ Cleanup complete:`);
console.log(`📦 Kept: ${keptCount} components`);
console.log(`🗑️  Removed: ${removedCount} problematic components`);
console.log(`\n📋 Remaining components:`);
remainingFiles.forEach(file => console.log(`   - ${file}`));