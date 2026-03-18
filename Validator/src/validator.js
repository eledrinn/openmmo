/**
 * OpenMMO Validator Core (Layered Architecture)
 * 
 * Layer 1: JSON Schema validation via AJV
 * Layer 2: OpenMMO semantic validation (references, circulars)
 * 
 * Wave 1.5 architecture: AJV-backed Layer 1 + Custom Layer 2
 */

const fs = require('fs');
const path = require('path');
const { ValidationError, ErrorTypes } = require('./errors');
const { layer1Validate, validateAgainstSchema } = require('./layer1');

// Re-export for backward compatibility
module.exports = {
  // Layer 1 (AJV-backed)
  layer1Validate,
  validateAgainstSchema,
  
  // Public API (Layer 1 + Layer 2)
  validateFile,
  validateFiles,
  validateValue,
  loadSchema,
  
  // Legacy exports (deprecated, for backward compatibility)
  validateType: () => { throw new Error('validateType deprecated - use layer1Validate'); },
  validateString: () => { throw new Error('validateString deprecated - use layer1Validate'); },
  validateNumber: () => { throw new Error('validateNumber deprecated - use layer1Validate'); }
};

/**
 * Load a schema from the Schemas directory
 * Delegates to layer1.js
 */
function loadSchema(schemaName) {
  return require('./layer1').loadSchema(schemaName);
}

/**
 * Validate a value against a schema (backward compatibility)
 * Now uses Layer 1 (AJV)
 */
function validateValue(value, schema, path = '', rootData = null) {
  // If schema is a string (schema name), use layer1Validate
  if (typeof schema === 'string') {
    const result = layer1Validate(value, schema);
    return result.errors;
  }
  
  // If schema is an object, use validateAgainstSchema
  const errors = validateAgainstSchema(value, schema);
  
  // Map errors to include path
  return errors.map(err => ({
    ...err,
    path: path ? `${path}.${err.path}` : err.path
  }));
}

/**
 * Validate a file against a schema
 * Layer 1: JSON Schema validation
 */
function validateFile(filePath, schemaName) {
  // Load and parse file
  let data;
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    data = JSON.parse(content);
  } catch (e) {
    if (e instanceof SyntaxError) {
      return {
        valid: false,
        errors: [{
          type: ErrorTypes.INVALID_JSON,
          message: `Invalid JSON: ${e.message}`,
          path: filePath,
          value: null
        }],
        data: null
      };
    }
    throw e;
  }
  
  // Layer 1: JSON Schema validation
  const layer1Result = layer1Validate(data, schemaName);
  
  return {
    valid: layer1Result.valid,
    errors: layer1Result.errors,
    data
  };
}

/**
 * Validate multiple files and collect all results
 */
function validateFiles(files, schemaName) {
  const results = [];
  
  for (const filePath of files) {
    const result = validateFile(filePath, schemaName);
    results.push({
      file: filePath,
      ...result
    });
  }
  
  return results;
}
