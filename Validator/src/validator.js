/**
 * OpenMMO Validator Core
 * 
 * Validates OpenMMO entities against Wave 1 schemas:
 * - id.schema.json (T003a)
 * - reference.schema.json (T003b)
 * - item.schema.json (T004)
 * - reward.schema.json (T005)
 */

const fs = require('fs');
const path = require('path');
const { ValidationError, ErrorTypes } = require('./errors');

// Schema cache
const schemas = {};
const SCHEMAS_DIR = path.join(__dirname, '..', '..', 'Schemas');

/**
 * Load a schema from the Schemas directory
 */
function loadSchema(schemaName) {
  if (schemas[schemaName]) {
    return schemas[schemaName];
  }
  
  const schemaPath = path.join(SCHEMAS_DIR, `${schemaName}.schema.json`);
  if (!fs.existsSync(schemaPath)) {
    throw new ValidationError(
      ErrorTypes.SCHEMA_NOT_FOUND,
      `Schema not found: ${schemaName}`,
      '',
      schemaName
    );
  }
  
  const content = fs.readFileSync(schemaPath, 'utf-8');
  schemas[schemaName] = JSON.parse(content);
  return schemas[schemaName];
}

/**
 * Validate a value against a JSON Schema type
 */
function validateType(value, expectedType, path) {
  const actualType = Array.isArray(value) ? 'array' : typeof value;
  
  if (expectedType === 'integer') {
    if (!Number.isInteger(value)) {
      return new ValidationError(
        ErrorTypes.INVALID_TYPE,
        `Expected integer, got ${actualType}`,
        path,
        value
      );
    }
    return null;
  }
  
  if (actualType !== expectedType) {
    return new ValidationError(
      ErrorTypes.INVALID_TYPE,
      `Expected ${expectedType}, got ${actualType}`,
      path,
      value
    );
  }
  
  return null;
}

/**
 * Validate a string against pattern, minLength, maxLength
 */
function validateString(value, schema, path) {
  const errors = [];
  
  if (schema.minLength !== undefined && value.length < schema.minLength) {
    errors.push(new ValidationError(
      ErrorTypes.STRING_TOO_SHORT,
      `String too short: ${value.length} < ${schema.minLength}`,
      path,
      value
    ));
  }
  
  if (schema.maxLength !== undefined && value.length > schema.maxLength) {
    errors.push(new ValidationError(
      ErrorTypes.STRING_TOO_LONG,
      `String too long: ${value.length} > ${schema.maxLength}`,
      path,
      value
    ));
  }
  
  if (schema.pattern) {
    const regex = new RegExp(schema.pattern);
    if (!regex.test(value)) {
      errors.push(new ValidationError(
        ErrorTypes.INVALID_PATTERN,
        `Value does not match pattern: ${schema.pattern}`,
        path,
        value
      ));
    }
  }
  
  if (schema.enum && !schema.enum.includes(value)) {
    errors.push(new ValidationError(
      ErrorTypes.INVALID_ENUM_VALUE,
      `Invalid enum value: "${value}". Allowed: ${schema.enum.join(', ')}`,
      path,
      value
    ));
  }
  
  return errors;
}

/**
 * Validate a number against minimum, maximum
 */
function validateNumber(value, schema, path) {
  const errors = [];
  
  if (schema.minimum !== undefined && value < schema.minimum) {
    errors.push(new ValidationError(
      ErrorTypes.NUMBER_OUT_OF_RANGE,
      `Value ${value} below minimum ${schema.minimum}`,
      path,
      value
    ));
  }
  
  if (schema.maximum !== undefined && value > schema.maximum) {
    errors.push(new ValidationError(
      ErrorTypes.NUMBER_OUT_OF_RANGE,
      `Value ${value} above maximum ${schema.maximum}`,
      path,
      value
    ));
  }
  
  return errors;
}

/**
 * Validate a value against a schema
 */
function validateValue(value, schema, path, rootData = null) {
  const errors = [];
  
  // Handle $ref - resolve reference to another schema
  if (schema.$ref) {
    const refName = schema.$ref.replace('openmmo://schemas/', '').replace('.schema.json', '');
    const refSchema = loadSchema(refName);
    return validateValue(value, refSchema, path, rootData);
  }
  
  // Type validation
  if (schema.type) {
    const typeError = validateType(value, schema.type, path);
    if (typeError) {
      errors.push(typeError);
      return errors; // Stop here if type is wrong
    }
  }
  
  // String validation
  if (schema.type === 'string' && typeof value === 'string') {
    errors.push(...validateString(value, schema, path));
  }
  
  // Number/integer validation
  if ((schema.type === 'number' || schema.type === 'integer') && typeof value === 'number') {
    errors.push(...validateNumber(value, schema, path));
  }
  
  // Array validation
  if (schema.type === 'array' && Array.isArray(value)) {
    if (schema.maxItems !== undefined && value.length > schema.maxItems) {
      errors.push(new ValidationError(
        ErrorTypes.ARRAY_TOO_LONG,
        `Array too long: ${value.length} > ${schema.maxItems}`,
        path,
        value
      ));
    }
    
    if (schema.items) {
      value.forEach((item, index) => {
        const itemErrors = validateValue(item, schema.items, `${path}[${index}]`, rootData);
        errors.push(...itemErrors);
      });
    }
  }
  
  // Object validation
  if (typeof value === 'object' && !Array.isArray(value)) {
    // Required fields (check even without explicit type: 'object')
    if (schema.required) {
      for (const field of schema.required) {
        if (!(field in value)) {
          errors.push(new ValidationError(
            ErrorTypes.REQUIRED_FIELD_MISSING,
            `Required field missing: ${field}`,
            path ? `${path}.${field}` : field,
            undefined
          ));
        }
      }
    }
    
    // Properties (only if type is object or not specified)
    if (schema.properties) {
      for (const [propName, propSchema] of Object.entries(schema.properties)) {
        if (propName in value) {
          const propErrors = validateValue(value[propName], propSchema, path ? `${path}.${propName}` : propName, rootData);
          errors.push(...propErrors);
        }
      }
    }
    
    // Additional properties check
    if (schema.additionalProperties === false) {
      const allowedProps = new Set(Object.keys(schema.properties || {}));
      for (const prop of Object.keys(value)) {
        if (!allowedProps.has(prop)) {
          errors.push(new ValidationError(
            ErrorTypes.INVALID_TYPE,
            `Additional property not allowed: ${prop}`,
            path ? `${path}.${prop}` : prop,
            value[prop]
          ));
        }
      }
    }
  }
  
  // Conditional validation (simple if/then support)
  if (schema.if && schema.then) {
    const ifSchema = schema.if;
    
    // Check if the "if" condition is met by validating only the relevant properties
    let ifConditionMet = true;
    if (ifSchema.properties) {
      for (const [propName, propCondition] of Object.entries(ifSchema.properties)) {
        if (propCondition.const !== undefined) {
          if (value[propName] !== propCondition.const) {
            ifConditionMet = false;
            break;
          }
        }
      }
    }
    
    // If condition is met, apply thenSchema
    if (ifConditionMet) {
      const thenErrors = validateValue(value, schema.then, path, rootData);
      errors.push(...thenErrors);
    }
  }
  
  // anyOf validation
  if (schema.anyOf) {
    const anyOfValid = schema.anyOf.some(subSchema => {
      const subErrors = validateValue(value, subSchema, path, rootData);
      return subErrors.length === 0;
    });
    
    if (!anyOfValid) {
      errors.push(new ValidationError(
        ErrorTypes.INVALID_TYPE,
        'Value does not match any of the required schemas',
        path,
        value
      ));
    }
  }
  
  // allOf validation - validate against all schemas
  if (schema.allOf) {
    for (const subSchema of schema.allOf) {
      const subErrors = validateValue(value, subSchema, path, rootData);
      errors.push(...subErrors);
    }
  }
  
  return errors;
}

/**
 * Validate a file against a schema
 */
function validateFile(filePath, schemaName) {
  const errors = [];
  
  // Load and parse file
  let data;
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    data = JSON.parse(content);
  } catch (e) {
    if (e instanceof SyntaxError) {
      return [new ValidationError(
        ErrorTypes.INVALID_JSON,
        `Invalid JSON: ${e.message}`,
        filePath,
        null
      )];
    }
    throw e;
  }
  
  // Load schema
  const schema = loadSchema(schemaName);
  
  // Validate against schema
  const validationErrors = validateValue(data, schema, '', data);
  errors.push(...validationErrors);
  
  return { valid: errors.length === 0, errors, data };
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

module.exports = {
  loadSchema,
  validateValue,
  validateFile,
  validateFiles,
  validateType,
  validateString,
  validateNumber
};
