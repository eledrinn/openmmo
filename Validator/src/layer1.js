const fs = require('fs');
const path = require('path');
const Ajv2020 = require('ajv/dist/2020').default;
const { ErrorTypes } = require('./errors');

const SCHEMA_DIR = path.join(__dirname, '..', '..', 'Schemas');
const schemaCache = {};
const validatorCache = {};

const ajv = new Ajv2020({
  allErrors: true,
  strict: false
});

function loadSchema(schemaName) {
  if (schemaCache[schemaName]) {
    return schemaCache[schemaName];
  }

  const schemaPath = path.join(SCHEMA_DIR, `${schemaName}.schema.json`);
  const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf-8'));
  schemaCache[schemaName] = schema;
  return schema;
}

function getValidator(schemaName) {
  if (validatorCache[schemaName]) {
    return validatorCache[schemaName];
  }

  const schema = loadSchema(schemaName);
  const validate = ajv.compile(schema);
  validatorCache[schemaName] = validate;
  return validate;
}

function pointerToPath(pointer = '') {
  if (!pointer) {
    return '';
  }
  return pointer.replace(/^\//, '').replace(/\//g, '.');
}

function formatAjvErrors(errors = []) {
  return errors.map((error) => {
    const basePath = pointerToPath(error.instancePath);
    let type = ErrorTypes.INVALID_TYPE;
    let pathValue = basePath;

    switch (error.keyword) {
      case 'required':
        type = ErrorTypes.REQUIRED_FIELD_MISSING;
        pathValue = basePath ? `${basePath}.${error.params.missingProperty}` : error.params.missingProperty;
        break;
      case 'enum':
        type = ErrorTypes.INVALID_ENUM_VALUE;
        break;
      case 'pattern':
        type = ErrorTypes.INVALID_PATTERN;
        break;
      case 'minLength':
        type = ErrorTypes.STRING_TOO_SHORT;
        break;
      case 'maxLength':
        type = ErrorTypes.STRING_TOO_LONG;
        break;
      case 'additionalProperties':
        type = ErrorTypes.INVALID_TYPE;
        pathValue = basePath ? `${basePath}.${error.params.additionalProperty}` : error.params.additionalProperty;
        break;
      case 'minimum':
      case 'exclusiveMinimum':
      case 'maximum':
      case 'exclusiveMaximum':
        type = ErrorTypes.NUMBER_OUT_OF_RANGE;
        break;
      case 'type':
        type = ErrorTypes.INVALID_TYPE;
        break;
      default:
        type = ErrorTypes.INVALID_TYPE;
    }

    return {
      type,
      path: pathValue,
      message: error.message || 'Schema validation error'
    };
  });
}

function layer1Validate(data, schemaName) {
  const validate = getValidator(schemaName);
  const valid = validate(data);
  const errors = valid ? [] : formatAjvErrors(validate.errors);
  return { valid, errors };
}

function validateAgainstSchema(value, schema) {
  const validate = ajv.compile(schema);
  const valid = validate(value);
  if (valid) {
    return [];
  }
  return formatAjvErrors(validate.errors);
}

module.exports = {
  layer1Validate,
  validateAgainstSchema,
  loadSchema
};
