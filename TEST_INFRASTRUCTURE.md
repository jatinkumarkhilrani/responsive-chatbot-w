# Test Infrastructure Documentation

This document describes the comprehensive testing infrastructure for the Sahaay messaging application.

## Testing Strategy

The testing infrastructure is designed to prevent regression and ensure deployment-ready code through multiple layers of validation:

### 1. Automated Testing Scripts

- **Location**: `scripts/test-ui.js`
- **Purpose**: Comprehensive validation of UI patterns, configuration, and common issues
- **Run Command**: `npm run test:ui`

### 2. Build Validation

- **GitHub Pages Build**: `npm run build:standalone`
- **Uses**: `vite.config.standalone.ts` - Clean configuration without Spark dependencies
- **Purpose**: Ensures code compiles and builds for deployment

### 3. Code Quality Checks

- **ESLint**: `npm run test:lint` - Code quality and style enforcement
- **TypeScript**: `npm run test:types` - Type safety validation
- **Combined**: `npm run test:ci` - Full CI pipeline

## Test Categories

### 1. Required Files Validation
- Checks for presence of essential project files
- Validates build configuration files
- Ensures proper project structure

### 2. Package Configuration
- Validates `package.json` scripts and dependencies
- Checks for required build scripts
- Verifies critical dependency availability

### 3. CSS & Styling Validation
- Tailwind CSS configuration checks
- CSS variable validation
- Responsive design pattern verification
- Theme configuration validation

### 4. HTML Configuration
- Meta tag validation for SEO/accessibility
- Required script and stylesheet links
- GitHub Pages routing configuration

### 5. React Component Structure
- Component import validation
- Error boundary and suspense checks
- Performance optimization patterns (memoization)

### 6. TypeScript Configuration
- Compiler options validation
- Target environment checks
- Module resolution verification

### 7. UI Pattern Analysis
- Responsive design implementation
- Accessibility attribute usage
- State management patterns

### 8. Vite Configuration
- Plugin configuration validation
- Build optimization checks
- Path alias verification

### 9. Performance Patterns
- React.memo usage validation
- Lazy loading implementation
- Bundle optimization checks

### 10. Security Validation
- XSS vulnerability checks
- Hardcoded secret detection
- Environment variable usage

## Common Issues Detected & Fixed

### 1. Build Issues
- **Issue**: Missing `build:github` script
- **Fix**: Added comprehensive build scripts in `package.json`
- **Prevention**: Test validates script presence

### 2. CSS/Tailwind Issues
- **Issue**: `--spacing()` function errors
- **Fix**: Proper CSS variable definition in theme
- **Prevention**: CSS validation in test suite

### 3. Import/Module Issues
- **Issue**: Missing component imports
- **Fix**: Created missing components or updated imports
- **Prevention**: TypeScript compilation check

### 4. Responsive Design Issues
- **Issue**: UI elements overlapping or not scaling
- **Fix**: Responsive utility classes and container queries
- **Prevention**: CSS pattern validation

### 5. TypeScript Errors
- **Issue**: Type mismatches and missing declarations
- **Fix**: Proper type definitions and interfaces
- **Prevention**: `tsc --noEmit` validation

## Running Tests

### Development Testing
```bash
npm run test          # Basic test suite
npm run test:lint     # ESLint only
npm run test:types    # TypeScript only
npm run test:build    # Build verification
npm run test:ui       # UI pattern validation
```

### CI/CD Testing
```bash
npm run test:ci       # Full CI pipeline
```

### Manual Testing Checklist

#### UI Responsiveness
- [ ] Sidebar scales properly on mobile (< 640px)
- [ ] Chat interface adapts to screen size
- [ ] Settings dialog displays correctly
- [ ] No overlapping UI elements
- [ ] Touch targets are adequate (44px minimum)

#### Functionality
- [ ] Message sending works
- [ ] Settings can be opened/closed
- [ ] Chat list displays properly
- [ ] AI responses generate correctly
- [ ] Error states display properly

#### Performance
- [ ] Initial load time < 3 seconds
- [ ] Smooth scrolling in message list
- [ ] No memory leaks during navigation
- [ ] Efficient re-renders with React.memo

#### Accessibility
- [ ] Keyboard navigation works
- [ ] Screen reader compatibility
- [ ] Proper ARIA labels
- [ ] Color contrast meets WCAG AA

## Continuous Improvement

### Adding New Tests
1. Identify regression patterns
2. Add validation to `scripts/test-ui.js`
3. Update this documentation
4. Test the test (meta-testing)

### Updating Test Thresholds
- Failed tests: 0 (must pass)
- Warnings: < 5 (review if exceeded)
- Coverage: Aim for comprehensive pattern detection

## Integration with Git Workflow

### Pre-commit Hooks
- Run `npm run precommit` before each commit
- Blocks commits with failed tests
- Ensures code quality maintenance

### GitHub Actions
- Automatic testing on push/PR
- Deployment only after successful tests
- Clear failure reporting

## Troubleshooting Common Test Failures

### "Required file missing"
- Ensure all files in the required list exist
- Check file permissions and accessibility

### "CSS variable missing"
- Verify theme definitions in CSS files
- Check Tailwind configuration

### "TypeScript compilation failed"
- Run `tsc --noEmit` locally for detailed errors
- Check import paths and type definitions

### "Build failed"
- Verify all dependencies are installed
- Check Vite configuration syntax
- Ensure no circular dependencies

## Performance Monitoring

### Build Metrics to Track
- Bundle size (target: < 1MB initial)
- Number of chunks generated
- Critical path resources
- Time to first paint

### Runtime Metrics
- Memory usage patterns
- Component render times
- Network request efficiency
- User interaction responsiveness

This testing infrastructure ensures reliable, performant, and accessible code deployment while preventing common regression issues.