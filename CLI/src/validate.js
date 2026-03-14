/**
 * OpenMMO CLI - Validate Command
 * 
 * Single command: openmmo validate
 * 
 * Usage:
 *   openmmo validate <file>           Validate single file
 *   openmmo validate --all            Validate entire project
 *   openmmo validate --help           Show help
 * 
 * Exit codes:
 *   0 - All validations passed
 *   1 - Validation errors found
 *   2 - Usage error / invalid arguments
 *   3 - Internal error
 */

const path = require('path');
const fs = require('fs');
const { validateFile, validateProject, getSummary, ErrorTypes } = require('../../Validator');

// Terminal colors (disable if not TTY)
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  gray: '\x1b[90m'
};

if (!process.stdout.isTTY) {
  Object.keys(colors).forEach(k => colors[k] = '');
}

/**
 * Format an error for display
 */
function formatError(error, verbose = false) {
  const parts = [];
  
  // Error type
  if (error.type) {
    parts.push(`${colors.red}[${error.type}]${colors.reset}`);
  }
  
  // Path
  if (error.path) {
    parts.push(`${colors.yellow}at ${error.path}${colors.reset}`);
  }
  
  // Message
  parts.push(error.message);
  
  // Value (if verbose)
  if (verbose && error.value !== undefined) {
    const valueStr = typeof error.value === 'object' 
      ? JSON.stringify(error.value) 
      : String(error.value);
    if (valueStr.length < 100) {
      parts.push(`${colors.gray}(value: ${valueStr})${colors.reset}`);
    }
  }
  
  return parts.join(' ');
}

/**
 * Print validation results for a single file
 */
function printFileResult(result, verbose = false) {
  const icon = result.valid ? `${colors.green}✓${colors.reset}` : `${colors.red}✗${colors.reset}`;
  console.log(`${icon} ${result.file}`);
  
  if (!result.valid && result.errors) {
    for (const error of result.errors) {
      console.log(`  ${formatError(error, verbose)}`);
    }
  }
}

/**
 * Print summary of validation results
 */
function printSummary(summary) {
  const { valid, invalid, totalFiles, totalErrors } = summary;
  
  console.log('');
  console.log(`${colors.gray}─`.repeat(50));
  
  if (invalid === 0) {
    console.log(`${colors.green}✓ All validations passed${colors.reset}`);
    console.log(`  ${valid}/${totalFiles} files valid`);
  } else {
    console.log(`${colors.red}✗ Validation failed${colors.reset}`);
    console.log(`  ${valid}/${totalFiles} files valid`);
    console.log(`  ${totalErrors} error${totalErrors === 1 ? '' : 's'} found`);
  }
  
  console.log(colors.reset);
}

/**
 * Show help text
 */
function showHelp() {
  console.log(`
${colors.blue}OpenMMO Validator${colors.reset} — Wave 1 Schema Validation

Usage:
  openmmo validate <file>     Validate a single JSON file
  openmmo validate --all      Validate all fixtures in project
  openmmo validate --help     Show this help message

Options:
  --verbose, -v    Show detailed error information
  --json           Output results as JSON

Exit Codes:
  0    All validations passed
  1    Validation errors found
  2    Invalid arguments
  3    Internal error

Examples:
  openmmo validate Fixtures/items/iron_sword.json
  openmmo validate --all
  openmmo validate --all --verbose
`);
}

/**
 * Parse command line arguments
 */
function parseArgs(args) {
  const result = {
    command: null,
    file: null,
    all: false,
    help: false,
    verbose: false,
    json: false
  };
  
  // First non-option argument should be 'validate'
  let i = 0;
  while (i < args.length) {
    const arg = args[i];
    
    if (arg === '--help' || arg === '-h') {
      result.help = true;
    } else if (arg === '--all' || arg === '-a') {
      result.all = true;
    } else if (arg === '--verbose' || arg === '-v') {
      result.verbose = true;
    } else if (arg === '--json' || arg === '-j') {
      result.json = true;
    } else if (!arg.startsWith('-')) {
      if (!result.command) {
        result.command = arg;
      } else if (!result.file && !result.all) {
        result.file = arg;
      }
    } else {
      throw new Error(`Unknown option: ${arg}`);
    }
    
    i++;
  }
  
  return result;
}

/**
 * Validate a single file
 */
function validateSingleFile(filePath, options) {
  // Resolve path
  const fullPath = path.resolve(filePath);
  
  // Check file exists
  if (!fs.existsSync(fullPath)) {
    console.error(`${colors.red}Error: File not found: ${filePath}${colors.reset}`);
    return 1;
  }
  
  // Detect schema from file content or path
  let schemaName = 'item'; // default
  const content = fs.readFileSync(fullPath, 'utf-8');
  try {
    const data = JSON.parse(content);
    if (data.id) {
      if (data.id.startsWith('reward_')) {
        schemaName = 'reward';
      } else if (data.id.startsWith('item_')) {
        schemaName = 'item';
      }
    }
  } catch (e) {
    // Invalid JSON, will be caught by validator
  }
  
  // Validate
  const result = validateFile(fullPath, schemaName);
  
  if (options.json) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    printFileResult(result, options.verbose);
    
    if (result.valid) {
      console.log(`${colors.green}✓ Validation passed${colors.reset}`);
    } else {
      console.log(`${colors.red}✗ Validation failed: ${result.errors.length} error(s)${colors.reset}`);
    }
  }
  
  return result.valid ? 0 : 1;
}

/**
 * Validate entire project
 */
function validateAll(options) {
  const basePath = process.cwd();
  
  const results = validateProject(basePath);
  
  if (options.json) {
    console.log(JSON.stringify(results, null, 2));
  } else {
    // Print item results
    if (results.items.length > 0) {
      console.log(`${colors.blue}Items:${colors.reset}`);
      for (const result of results.items) {
        printFileResult(result, options.verbose);
      }
    }
    
    // Print reward results
    if (results.rewards.length > 0) {
      console.log(`${colors.blue}Rewards:${colors.reset}`);
      for (const result of results.rewards) {
        printFileResult(result, options.verbose);
      }
    }
    
    // Print circular reference errors
    if (results.errors.length > 0) {
      console.log(`${colors.red}Circular References:${colors.reset}`);
      for (const error of results.errors) {
        console.log(`  ${formatError(error, options.verbose)}`);
      }
    }
    
    // Print summary
    const summary = getSummary(results);
    printSummary(summary);
  }
  
  return results.valid ? 0 : 1;
}

/**
 * Main entry point
 */
function main(args) {
  try {
    const options = parseArgs(args);
    
    // Show help
    if (options.help || !options.command) {
      showHelp();
      return 0;
    }
    
    // Validate command
    if (options.command !== 'validate') {
      console.error(`${colors.red}Error: Unknown command: ${options.command}${colors.reset}`);
      console.error(`Only 'validate' command is supported.`);
      return 2;
    }
    
    // Validate single file or all
    if (options.all) {
      return validateAll(options);
    } else if (options.file) {
      return validateSingleFile(options.file, options);
    } else {
      console.error(`${colors.red}Error: No file specified. Use --all to validate entire project.${colors.reset}`);
      return 2;
    }
    
  } catch (error) {
    console.error(`${colors.red}Error: ${error.message}${colors.reset}`);
    return 3;
  }
}

module.exports = { main, parseArgs, showHelp };

// Run if called directly
if (require.main === module) {
  const args = process.argv.slice(2);
  const exitCode = main(args);
  process.exit(exitCode);
}
