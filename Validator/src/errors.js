/**
 * OpenMMO Validator Error Types
 * 
 * Defines all error types the validator can report.
 * Errors are actionable and include path information.
 */

class ValidationError extends Error {
  constructor(type, message, path, value) {
    super(message);
    this.name = 'ValidationError';
    this.type = type;
    this.path = path || '';
    this.value = value;
  }
}

const ErrorTypes = {
  // Schema-level errors
  INVALID_JSON: 'INVALID_JSON',
  SCHEMA_NOT_FOUND: 'SCHEMA_NOT_FOUND',
  
  // ID format errors (T003a)
  INVALID_ID_FORMAT: 'INVALID_ID_FORMAT',
  ID_TOO_SHORT: 'ID_TOO_SHORT',
  ID_TOO_LONG: 'ID_TOO_LONG',
  
  // Reference errors (T003b)
  INVALID_REFERENCE_FORMAT: 'INVALID_REFERENCE_FORMAT',
  REFERENCE_NOT_FOUND: 'REFERENCE_NOT_FOUND',
  INVALID_REFERENCE_TARGET: 'INVALID_REFERENCE_TARGET',
  
  // Schema validation errors
  REQUIRED_FIELD_MISSING: 'REQUIRED_FIELD_MISSING',
  INVALID_TYPE: 'INVALID_TYPE',
  INVALID_ENUM_VALUE: 'INVALID_ENUM_VALUE',
  STRING_TOO_SHORT: 'STRING_TOO_SHORT',
  STRING_TOO_LONG: 'STRING_TOO_LONG',
  NUMBER_OUT_OF_RANGE: 'NUMBER_OUT_OF_RANGE',
  INVALID_PATTERN: 'INVALID_PATTERN',
  ARRAY_TOO_LONG: 'ARRAY_TOO_LONG',
  
  // Content errors
  EMPTY_REWARD_CONTENT: 'EMPTY_REWARD_CONTENT',
  
  // Circular reference (defined in T003b, detected here)
  CIRCULAR_REFERENCE: 'CIRCULAR_REFERENCE'
};

function formatError(error) {
  return {
    type: error.type,
    message: error.message,
    path: error.path,
    value: error.value
  };
}

module.exports = {
  ValidationError,
  ErrorTypes,
  formatError
};
