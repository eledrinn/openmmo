# OpenMMO

**Wave 1 Release** — Open, engine-agnostic progression-content spec and toolchain

[![Validator Tests](https://img.shields.io/badge/validator-28%2F28%20passing-brightgreen)]()
[![CLI Tests](https://img.shields.io/badge/cli-22%2F22%20passing-brightgreen)]()
[![Fixtures](https://img.shields.io/badge/fixtures-31-blue)]()

## What is OpenMMO?

OpenMMO is an open specification and toolchain for MMO-style progression content. Wave 1 establishes the foundation with schemas for items and rewards, a validator, and a CLI tool.

## Quick Start

### Install

```bash
git clone <repository>
cd openmmo
```

### Validate a File

```bash
./CLI/bin/openmmo validate Fixtures/items/valid/01_consumable_potion.json
```

### Validate Everything

```bash
./CLI/bin/openmmo validate --all
```

## What's in Wave 1

| Component | Description | Status |
|-----------|-------------|--------|
| **Schemas** | ID, reference, item, reward | ✅ Complete |
| **Validator** | JSON Schema validation engine | ✅ Complete |
| **CLI** | `openmmo validate` command | ✅ Complete |
| **Fixtures** | 31 test fixtures | ✅ Complete |

## Project Structure

```
openmmo/
├── Schemas/              # JSON Schema definitions
│   ├── id.schema.json
│   ├── reference.schema.json
│   ├── item.schema.json
│   └── reward.schema.json
├── Validator/            # Validation engine
│   ├── src/
│   └── tests/
├── CLI/                  # Command-line interface
│   ├── bin/openmmo
│   └── src/
├── Fixtures/             # Test fixtures
│   ├── items/
│   └── rewards/
├── docs/                 # Documentation
│   ├── getting-started.md
│   ├── schemas.md
│   ├── validator.md
│   ├── cli.md
│   └── fixtures.md
└── Policies/             # Governance
    └── ...
```

## Documentation

- [Getting Started](docs/getting-started.md) — Installation and first steps
- [Schemas](docs/schemas.md) — Schema reference
- [Validator](docs/validator.md) — Using the validator
- [CLI](docs/cli.md) — Command-line usage
- [Fixtures](docs/fixtures.md) — Test fixtures

## Wave 1 Scope

### In Scope
- ✅ Item definitions (consumable, equipment, material, quest)
- ✅ Reward definitions (items, currency, experience)
- ✅ Schema validation
- ✅ CLI validation tool
- ✅ Test fixtures

### Out of Scope (Future Waves)
- ❌ Quests
- ❌ Vendors/Shops
- ❌ Crafting recipes
- ❌ Migrations
- ❌ Godot integration
- ❌ Plugin SDK

See [WAVE1-NON-GOALS.md](WAVE1-NON-GOALS.md) for full list.

## Testing

```bash
# Run validator tests
cd Validator && npm test

# Run CLI tests
cd CLI && npm test

# Validate all fixtures
./CLI/bin/openmmo validate --all
```

## License

MIT

---

**Status:** Wave 1 Complete — Ready for use
