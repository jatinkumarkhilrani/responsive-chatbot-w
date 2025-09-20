# Testing Infrastructure Documentation

## Overview

This project includes a comprehensive testing infrastructure to prevent regressions and ensure deployments are successful. The testing infrastructure addresses all known production issues.

## Test Suites

### 1. Basic Tests (`test:basic`)
- **Purpose**: Quick validation of essential file structure and configuration
- **Script**: `scripts/test-basic.js`
- **What it checks**:
  - Required files exist (package.json, config files, core components)
  - Package.json has required scripts
  - CSS configuration includes spacing system (prevents Tailwind errors)
  - GitHub Pages configuration is correct

### 2. Comprehensive Tests (`test:comprehensive`)
- **Purpose**: Full regression testing covering all known production issues
- **Script**: `scripts/test-comprehensive.js`
- **What it checks**:
  - Dependencies and scripts validation
  - TypeScript build testing
  - UI responsiveness patterns
  - Configuration files validity
  - File structure integrity
  - Performance thresholds
  - GitHub Pages compatibility
  - Security patterns

### 3. UI Tests (`test:ui`)
- **Purpose**: UI-specific responsiveness and layout validation
- **Script**: `scripts/test-ui.js`
- **What it checks**:
  - UI component structure
  - Responsive CSS patterns
  - Layout container classes
  - Mobile-first design patterns

### 4. Performance Tests (`test:performance`)
- **Purpose**: Prevents browser hangs and performance degradation
- **Script**: `scripts/test-performance.js`
- **What it checks**:
  - Bundle size thresholds (prevents >10MB bundles that hang browsers)
  - Code complexity patterns
  - Memory leak risks
  - Problematic performance patterns

## Pre-commit Hooks

### Husky Integration
The project uses Husky to run tests before every commit:

```bash
.husky/pre-commit
```

**What runs on commit**:
1. TypeScript type checking (`test:types`)
2. UI tests (`test:ui`)
3. Build tests (`test:build`)
4. Performance checks (`test:performance`)  
5. Comprehensive regression tests (`test:comprehensive`)

### Setup
```bash
npm install  # Automatically sets up husky hooks via postinstall
```

## CI/CD Integration

### GitHub Actions Workflow
- **File**: `.github/workflows/test-and-deploy.yml`
- **Triggers**: Push to main/develop, Pull Requests
- **Jobs**:
  - **test**: Runs comprehensive test suite on Node 18.x and 20.x
  - **deploy-github-pages**: Deploys to GitHub Pages after tests pass
  - **performance-audit**: Bundle analysis on PRs

### Handling Package.json Sync Issues
The workflow includes fallback logic for package-lock.json sync issues:

```yaml
- name: Install dependencies
  run: |
    if ! npm ci; then
      echo "npm ci failed, attempting npm install..."
      rm -rf node_modules package-lock.json
      npm install
    fi
```

## Running Tests Locally

### Individual Test Suites
```bash
npm run test:basic           # Quick basic validation
npm run test:ui              # UI and responsiveness
npm run test:performance     # Performance and bundle size
npm run test:comprehensive   # Full regression testing
npm run test:types           # TypeScript validation
npm run test:build           # Build testing
```

### Combined Tests
```bash
npm run test:ci              # CI suite (types + comprehensive)
npm test                     # Same as test:ci
npm run precommit            # Same as test:ci
```

## Error Prevention

### Known Production Issues Addressed

1. **Tailwind Spacing Errors**
   - Tests verify `--spacing-*` variables in main.css
   - Prevents `[@tailwindcss/vite:generate:build] The --spacing(…) function requires that the --spacing theme variable exists` errors

2. **Bundle Size Issues**
   - Tests fail if bundle >10MB (causes browser hangs)
   - Warns if bundle >5MB
   - Tracks individual file sizes

3. **GitHub Pages Configuration**
   - Validates base path configuration
   - Checks routing setup
   - Verifies build outputs

4. **TypeScript Errors**
   - Full type checking before builds
   - Catches type mismatches
   - Validates all imports

5. **UI Responsiveness**
   - Validates responsive CSS patterns
   - Checks container classes
   - Ensures mobile compatibility

6. **Memory Leaks**
   - Scans for addEventListener without removeEventListener
   - Checks for uncleared timers
   - Validates resource cleanup

## Customization

### Adding New Tests
1. Create test file in `scripts/` directory
2. Use ES module syntax (the project uses `"type": "module"`)
3. Add corresponding npm script to package.json
4. Update pre-commit hook if needed

### Test Structure Example
```javascript
#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

function myTest() {
  // Test logic here
  return true; // or false
}

if (import.meta.url === `file://${process.argv[1]}`) {
  myTest();
}

export { myTest };
```

### Modifying Thresholds
Edit the test files directly to adjust:
- Bundle size limits (currently 10MB max, 5MB warning)
- Memory leak pattern tolerance
- Performance thresholds

## Troubleshooting

### Common Issues

1. **Test fails with "require is not defined"**
   - Ensure test files use ES module syntax
   - Use `import` instead of `require`
   - Include proper file header with module imports

2. **GitHub Pages deployment fails**
   - Check base path in `vite.config.github.ts`
   - Verify build outputs in `dist/` directory
   - Ensure no hardcoded localhost references

3. **Bundle too large errors**
   - Run `npm run test:performance` to see bundle analysis
   - Check for large dependencies
   - Use code splitting if necessary

4. **Husky hooks not running**
   - Run `npm run postinstall` manually
   - Check `.husky/pre-commit` file permissions
   - Verify git hooks are enabled

## Best Practices

1. **Always run tests locally before pushing**
2. **Keep bundle sizes minimal** - prefer lightweight alternatives
3. **Use responsive CSS patterns** - test on multiple screen sizes  
4. **Monitor performance** - browser hangs are user-experience killers
5. **Update tests when adding features** - prevent future regressions

This testing infrastructure ensures that all known production issues are caught before deployment, providing confidence in the application's stability and performance.