# CLI Documentation

The OpenMMO CLI provides the `openmmo validate` command for validating entities.

## Installation

The CLI is included in the OpenMMO repository. No separate installation required.

```bash
./CLI/bin/openmmo --help
```

## Commands

### validate

Validate JSON files against OpenMMO schemas.

#### Usage

```bash
openmmo validate <file>        # Validate single file
openmmo validate --all         # Validate entire project
openmmo validate --help        # Show help
```

#### Options

| Option | Short | Description |
|--------|-------|-------------|
| `--all` | `-a` | Validate all fixtures in project |
| `--verbose` | `-v` | Show detailed error information |
| `--json` | `-j` | Output results as JSON |
| `--help` | `-h` | Show help |

#### Exit Codes

| Code | Meaning |
|------|---------|
| 0 | All validations passed |
| 1 | Validation errors found |
| 2 | Invalid arguments |
| 3 | Internal error |

## Examples

### Validate Single File

```bash
./CLI/bin/openmmo validate Fixtures/items/valid/01_consumable_potion.json
```

Output:
```
✓ Fixtures/items/valid/01_consumable_potion.json
✓ Validation passed
```

### Validate with Verbose Output

```bash
./CLI/bin/openmmo validate -v Fixtures/items/invalid/04_equipment_missing_slot.json
```

Output:
```
✗ Fixtures/items/invalid/04_equipment_missing_slot.json
  [REQUIRED_FIELD_MISSING] at equipment_slot Required field missing: equipment_slot
✗ Validation failed: 1 error(s)
```

### Validate All Fixtures

```bash
./CLI/bin/openmmo validate --all
```

Output:
```
Items:
  ✓ Fixtures/items/valid/01_consumable_potion.json
  ✓ Fixtures/items/valid/02_consumable_mana.json
  ...
Rewards:
  ✓ Fixtures/rewards/valid/01_currency_gold.json
  ...
──────────────────────────────────────────────────
✓ All validations passed
  17/17 files valid
```

### Output as JSON

```bash
./CLI/bin/openmmo validate --json my_item.json
```

Output:
```json
{
  "file": "/path/to/my_item.json",
  "valid": false,
  "errors": [
    {
      "type": "REQUIRED_FIELD_MISSING",
      "message": "Required field missing: item_type",
      "path": "item_type",
      "value": undefined
    }
  ],
  "data": { ... }
}
```

### Validate Invalid File (Expected to Fail)

```bash
./CLI/bin/openmmo validate Fixtures/items/invalid/03_invalid_enum_type.json
echo "Exit code: $?"
```

Output:
```
✗ Fixtures/items/invalid/03_invalid_enum_type.json
  [INVALID_ENUM_VALUE] at item_type Invalid enum value: "weapon". Allowed: consumable, equipment, material, quest
✗ Validation failed: 1 error(s)

Exit code: 1
```

## Auto-Detecting Schema

The CLI automatically detects which schema to use based on the file content:

- Files with `id` starting with `item_` → item schema
- Files with `id` starting with `reward_` → reward schema

## Common Workflows

### Validate During Development

```bash
# Edit your file
vim my_item.json

# Validate it
./CLI/bin/openmmo validate my_item.json

# If errors, fix and validate again
```

### Validate Before Commit

```bash
# Validate all fixtures before committing
./CLI/bin/openmmo validate --all

# Exit code 0 means all tests passed
if [ $? -eq 0 ]; then
  echo "All fixtures valid, ready to commit"
fi
```

### CI/CD Integration

```yaml
# Example GitHub Actions step
- name: Validate OpenMMO fixtures
  run: |
    ./CLI/bin/openmmo validate --all
    if [ $? -ne 0 ]; then
      echo "Validation failed"
      exit 1
    fi
```

## Troubleshooting

### File Not Found

```bash
./CLI/bin/openmmo validate nonexistent.json
# Error: File not found: nonexistent.json
# Exit code: 1
```

**Fix:** Check the file path and ensure the file exists.

### Unknown Command

```bash
./CLI/bin/openmmo migrate
# Error: Unknown command: migrate
# Only 'validate' command is supported.
# Exit code: 2
```

**Fix:** Use `validate` command. Other commands are not implemented in Wave 1.

### JSON Parse Error

```bash
./CLI/bin/openmmo validate invalid.json
# Error: Invalid JSON: Unexpected token ...
# Exit code: 3
```

**Fix:** Ensure the file contains valid JSON.

## Scripting

The CLI is designed for scripting:

```bash
#!/bin/bash

# Validate all items
for file in my_items/*.json; do
  if ! ./CLI/bin/openmmo validate "$file" > /dev/null 2>&1; then
    echo "FAILED: $file"
    exit 1
  fi
done

echo "All items valid!"
```

Or with JSON output for processing:

```bash
./CLI/bin/openmmo validate --json my_item.json | jq '.valid'
```
