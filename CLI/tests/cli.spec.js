/**
 * OpenMMO CLI Test Suite
 * 
 * Tests for T007: openmmo validate command
 */

const { main, parseArgs } = require('../src/validate');
const fs = require('fs');
const path = require('path');

// Test utilities
let testsRun = 0;
let testsPassed = 0;
let testsFailed = 0;

function test(name, fn) {
  testsRun++;
  try {
    fn();
    testsPassed++;
    console.log(`  ✅ ${name}`);
  } catch (e) {
    testsFailed++;
    console.log(`  ❌ ${name}`);
    console.log(`     Error: ${e.message}`);
  }
}

function assertEqual(actual, expected, msg) {
  if (actual !== expected) {
    throw new Error(`${msg || 'Assertion failed'}: expected ${expected}, got ${actual}`);
  }
}

function assertTrue(value, msg) {
  if (!value) {
    throw new Error(msg || 'Expected true');
  }
}

// Capture console output
function captureOutput(fn) {
  const logs = [];
  const errors = [];
  const originalLog = console.log;
  const originalError = console.error;
  
  console.log = (...args) => logs.push(args.join(' '));
  console.error = (...args) => errors.push(args.join(' '));
  
  try {
    const result = fn();
    return { result, logs, errors };
  } finally {
    console.log = originalLog;
    console.error = originalError;
  }
}

// ========== ARGUMENT PARSING TESTS ==========
console.log('\n📋 Argument Parsing Tests');

test('Parse validate command', () => {
  const args = parseArgs(['validate', 'file.json']);
  assertEqual(args.command, 'validate', 'Should parse command');
  assertEqual(args.file, 'file.json', 'Should parse file');
});

test('Parse --all flag', () => {
  const args = parseArgs(['validate', '--all']);
  assertEqual(args.command, 'validate', 'Should parse command');
  assertTrue(args.all, 'Should parse --all');
});

test('Parse --verbose flag', () => {
  const args = parseArgs(['validate', '--all', '--verbose']);
  assertTrue(args.verbose, 'Should parse --verbose');
});

test('Parse -v shorthand', () => {
  const args = parseArgs(['validate', '-v', 'file.json']);
  assertTrue(args.verbose, 'Should parse -v');
});

test('Parse --json flag', () => {
  const args = parseArgs(['validate', '--all', '--json']);
  assertTrue(args.json, 'Should parse --json');
});

test('Parse --help flag', () => {
  const args = parseArgs(['--help']);
  assertTrue(args.help, 'Should parse --help');
});

test('Unknown option throws error', () => {
  let threw = false;
  try {
    parseArgs(['validate', '--unknown']);
  } catch (e) {
    threw = true;
  }
  assertTrue(threw, 'Should throw on unknown option');
});

// ========== EXIT CODE TESTS ==========
console.log('\n🔢 Exit Code Tests');

test('Help returns exit code 0', () => {
  const { result } = captureOutput(() => main(['--help']));
  assertEqual(result, 0, 'Help should exit 0');
});

test('No command returns exit code 0 (shows help)', () => {
  const { result } = captureOutput(() => main([]));
  assertEqual(result, 0, 'No command should exit 0');
});

test('Unknown command returns exit code 2', () => {
  const { result } = captureOutput(() => main(['unknown']));
  assertEqual(result, 2, 'Unknown command should exit 2');
});

test('No file specified returns exit code 2', () => {
  const { result } = captureOutput(() => main(['validate']));
  assertEqual(result, 2, 'No file should exit 2');
});

test('Non-existent file returns exit code 1', () => {
  const { result } = captureOutput(() => main(['validate', 'nonexistent.json']));
  assertEqual(result, 1, 'Non-existent file should exit 1');
});

// ========== OUTPUT FORMAT TESTS ==========
console.log('\n📝 Output Format Tests');

test('Help output contains usage info', () => {
  const { logs } = captureOutput(() => main(['--help']));
  const output = logs.join('\n');
  assertTrue(output.includes('Usage:'), 'Should show usage');
  assertTrue(output.includes('validate'), 'Should mention validate command');
});

test('Help output mentions --all flag', () => {
  const { logs } = captureOutput(() => main(['--help']));
  const output = logs.join('\n');
  assertTrue(output.includes('--all'), 'Should mention --all flag');
});

test('Help output mentions exit codes', () => {
  const { logs } = captureOutput(() => main(['--help']));
  const output = logs.join('\n');
  assertTrue(output.includes('Exit Codes'), 'Should mention exit codes');
});

test('JSON output is valid JSON', () => {
  // Create a temporary valid file
  const tmpFile = path.join(__dirname, 'tmp-valid.json');
  fs.writeFileSync(tmpFile, JSON.stringify({
    id: 'item_test_cli',
    name: 'Test Item',
    item_type: 'material'
  }));
  
  const { logs } = captureOutput(() => main(['validate', '--json', tmpFile]));
  
  // Clean up
  fs.unlinkSync(tmpFile);
  
  // Parse JSON output
  const output = logs.join('\n');
  const data = JSON.parse(output);
  assertTrue(typeof data.valid === 'boolean', 'Should have valid boolean');
});

// ========== VALIDATION INTEGRATION TESTS ==========
console.log('\n🔗 Validation Integration Tests');

test('Valid item file exits 0', () => {
  const tmpFile = path.join(__dirname, 'tmp-item.json');
  fs.writeFileSync(tmpFile, JSON.stringify({
    id: 'item_test_valid',
    name: 'Valid Test Item',
    item_type: 'material',
    stackable: true
  }));
  
  const { result } = captureOutput(() => main(['validate', tmpFile]));
  
  fs.unlinkSync(tmpFile);
  assertEqual(result, 0, 'Valid item should exit 0');
});

test('Invalid item file exits 1', () => {
  const tmpFile = path.join(__dirname, 'tmp-invalid.json');
  fs.writeFileSync(tmpFile, JSON.stringify({
    id: 'item_test_invalid',
    name: 'Invalid Test Item',
    item_type: 'invalid_type'
  }));
  
  const { result } = captureOutput(() => main(['validate', tmpFile]));
  
  fs.unlinkSync(tmpFile);
  assertEqual(result, 1, 'Invalid item should exit 1');
});

test('Output shows validation errors', () => {
  const tmpFile = path.join(__dirname, 'tmp-errors.json');
  fs.writeFileSync(tmpFile, JSON.stringify({
    id: 'item_test_errors',
    name: 'Test',
    item_type: 'invalid_type'
  }));
  
  const { logs } = captureOutput(() => main(['validate', tmpFile]));
  
  fs.unlinkSync(tmpFile);
  
  const output = logs.join('\n');
  assertTrue(output.includes('✗') || output.includes('Error'), 'Should show error indicator');
});

// ========== SCOPE CONTAINMENT TESTS ==========
console.log('\n🛡️ Scope Containment Tests');

test('Only validate command is supported', () => {
  const { result, errors } = captureOutput(() => main(['diff']));
  assertEqual(result, 2, 'Should reject diff command');
  assertTrue(errors.some(e => e.includes('Only')), 'Should mention only validate is supported');
});

test('migrate command is rejected', () => {
  const { result } = captureOutput(() => main(['migrate']));
  assertEqual(result, 2, 'Should reject migrate command');
});

test('init command is rejected', () => {
  const { result } = captureOutput(() => main(['init']));
  assertEqual(result, 2, 'Should reject init command');
});

// ========== SUMMARY ==========
console.log('\n📊 Test Summary');
console.log(`  Total:  ${testsRun}`);
console.log(`  Passed: ${testsPassed}`);
console.log(`  Failed: ${testsFailed}`);

if (testsFailed > 0) {
  process.exit(1);
}

console.log('\n✅ All CLI tests passed!');
