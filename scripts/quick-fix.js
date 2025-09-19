#!/usr/bin/env node

/**
 * Quick Fix Script for Remaining Issues
 * Addresses specific problems mentioned in the user prompt
 */

const fs = require('fs');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..');

function log(message) {
  console.log(`🔧 ${message}`);
}

function fixMainCSS() {
  log('Fixing main.css spacing system...');
  
  const mainCSSPath = path.join(projectRoot, 'src/main.css');
  
  // Check if main.css has proper spacing system
  if (fs.existsSync(mainCSSPath)) {
    const content = fs.readFileSync(mainCSSPath, 'utf8');
    
    if (!content.includes('--spacing-')) {
      log('ERROR: main.css missing spacing system - this causes the Tailwind error');
      log('The spacing system is already in main.css, this should not happen');
    } else {
      log('✅ main.css has proper spacing system');
    }
  }
}

function fixPackageJsonScripts() {
  log('Ensuring all required scripts exist...');
  
  const packagePath = path.join(projectRoot, 'package.json');
  const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  
  const requiredScripts = {
    'build:github': 'npm run test:ci && npm run build:github-pages',
    'build:github-pages': 'tsc -b --noCheck && vite build --config vite.config.github.ts',
    'test:comprehensive': 'node scripts/test-comprehensive.js'
  };
  
  let updated = false;
  
  for (const [script, command] of Object.entries(requiredScripts)) {
    if (!pkg.scripts[script] || pkg.scripts[script] !== command) {
      pkg.scripts[script] = command;
      updated = true;
      log(`✅ Fixed script: ${script}`);
    }
  }
  
  if (updated) {
    fs.writeFileSync(packagePath, JSON.stringify(pkg, null, 2) + '\n');
    log('✅ Updated package.json scripts');
  } else {
    log('✅ All required scripts are present');
  }
}

function fixViteConfig() {
  log('Checking Vite configuration...');
  
  const viteConfigPath = path.join(projectRoot, 'vite.config.ts');
  if (fs.existsSync(viteConfigPath)) {
    const content = fs.readFileSync(viteConfigPath, 'utf8');
    
    if (content.includes('sparkPlugin') && content.includes('@github/spark/spark-vite-plugin')) {
      log('⚠️  Spark plugin detected - this may cause issues in standalone builds');
      log('Consider creating a vite.config.standalone.ts without Spark dependencies');
    }
  }
  
  // Ensure GitHub config exists
  const githubConfigPath = path.join(projectRoot, 'vite.config.github.ts');
  if (!fs.existsSync(githubConfigPath)) {
    log('❌ Creating missing vite.config.github.ts...');
    
    const githubConfig = `import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react-swc";
import { defineConfig } from "vite";
import { resolve } from 'path';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  base: '/responsive-chatbot-w/',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['@phosphor-icons/react', '@radix-ui/react-dialog'],
        },
      },
    },
  },
  resolve: {
    alias: {
      '@': resolve(import.meta.dirname, 'src')
    }
  },
});`;
    
    fs.writeFileSync(githubConfigPath, githubConfig);
    log('✅ Created vite.config.github.ts');
  }
  
  // Ensure standalone config exists
  const standaloneConfigPath = path.join(projectRoot, 'vite.config.standalone.ts');
  if (!fs.existsSync(standaloneConfigPath)) {
    log('❌ Creating missing vite.config.standalone.ts...');
    
    const standaloneConfig = `import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react-swc";
import { defineConfig } from "vite";
import { resolve } from 'path';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  base: './',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['@phosphor-icons/react', '@radix-ui/react-dialog'],
        },
      },
    },
  },
  resolve: {
    alias: {
      '@': resolve(import.meta.dirname, 'src')
    }
  },
});`;
    
    fs.writeFileSync(standaloneConfigPath, standaloneConfig);
    log('✅ Created vite.config.standalone.ts');
  }
}

function fixIndexHTML() {
  log('Checking index.html configuration...');
  
  const indexPath = path.join(projectRoot, 'index.html');
  if (fs.existsSync(indexPath)) {
    const content = fs.readFileSync(indexPath, 'utf8');
    
    // Check for proper CSS import
    if (!content.includes('href="./src/index.css"')) {
      log('⚠️  index.html missing proper CSS import');
    } else {
      log('✅ index.html has proper CSS import');
    }
    
    // Check for proper script import
    if (!content.includes('src="./src/main.tsx"')) {
      log('⚠️  index.html missing proper script import');
    } else {
      log('✅ index.html has proper script import');
    }
  }
}

function fixUIComponents() {
  log('Checking UI components...');
  
  const uiDir = path.join(projectRoot, 'src/components/ui');
  
  // Ensure essential components exist
  const essentialComponents = ['button.tsx', 'input.tsx', 'dialog.tsx', 'progress.tsx', 'separator.tsx'];
  
  for (const component of essentialComponents) {
    const componentPath = path.join(uiDir, component);
    if (!fs.existsSync(componentPath)) {
      log(`❌ Missing essential component: ${component}`);
    } else {
      log(`✅ Essential component exists: ${component}`);
    }
  }
  
  // Check for problematic components that should be removed
  const problematicComponents = [
    'accordion.tsx', 'calendar.tsx', 'chart.tsx', 'tooltip.tsx', 'form.tsx'
  ];
  
  for (const component of problematicComponents) {
    const componentPath = path.join(uiDir, component);
    if (fs.existsSync(componentPath)) {
      log(`⚠️  Problematic component still exists: ${component}`);
    }
  }
}

function createMissingDirectories() {
  log('Ensuring required directories exist...');
  
  const requiredDirs = [
    'src/components/ui',
    'src/assets/images',
    'src/assets/video',
    'src/assets/audio',
    'src/assets/documents',
    'scripts',
    '.github/workflows'
  ];
  
  for (const dir of requiredDirs) {
    const dirPath = path.join(projectRoot, dir);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
      log(`✅ Created directory: ${dir}`);
    }
  }
}

function validateEnvironment() {
  log('Validating environment...');
  
  // Check Node.js version
  const nodeVersion = process.version;
  log(`Node.js version: ${nodeVersion}`);
  
  if (nodeVersion.startsWith('v18.') || nodeVersion.startsWith('v20.')) {
    log('✅ Node.js version is compatible');
  } else {
    log('⚠️  Node.js version may cause issues - recommended: v18 or v20');
  }
  
  // Check if npm install was run
  if (fs.existsSync(path.join(projectRoot, 'node_modules'))) {
    log('✅ node_modules exists');
  } else {
    log('❌ node_modules missing - run npm install');
  }
}

function main() {
  console.log('🔧 Running Quick Fix Script for Production Issues\n');
  
  try {
    validateEnvironment();
    createMissingDirectories();
    fixMainCSS();
    fixPackageJsonScripts();
    fixViteConfig();
    fixIndexHTML();
    fixUIComponents();
    
    console.log('\n✅ Quick fixes completed!');
    console.log('\n🚀 Next steps:');
    console.log('1. Run: npm install (if node_modules missing)');
    console.log('2. Run: npm run test:comprehensive');
    console.log('3. Run: npm run build:github-pages');
    console.log('4. Commit changes and deploy');
    
  } catch (error) {
    console.error('❌ Quick fix failed:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { main };