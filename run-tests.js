#!/usr/bin/env node

/**
 * Direct test runner to bypass npm restrictions
 */

import { runAllTests } from './scripts/test-comprehensive.js';

// Run the comprehensive test suite
runAllTests();