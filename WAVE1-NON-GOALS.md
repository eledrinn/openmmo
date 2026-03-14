# Wave 1 Non-Goals

This document explicitly lists what is **NOT** included in OpenMMO Wave 1. These features are deferred to future waves or are out of scope entirely.

## Out of Scope (Future Waves)

### Quest System
- Quest definitions
- Quest objectives
- Quest chains
- Quest states/progress tracking
- Quest rewards (beyond basic reward references)
- Quest givers/NPCs

### Vendor/Shop System
- Vendor definitions
- Shop inventories
- Buy/sell logic
- Price calculations
- Currency exchange
- Vendor UI

### Crafting System
- Recipes
- Crafting stations
- Material processing
- Recipe discovery
- Crafting skill levels

### Inventory System
- Inventory management
- Item stacking logic (beyond schema definition)
- Bank/storage
- Item transfer
- Equipment sets

### Combat/Gameplay
- Combat mechanics
- Damage calculation
- Stat application
- Buffs/debuffs
- Skill systems

### Character System
- Character classes
- Skill trees
- Talent systems
- Character progression (beyond item level requirements)

### World/Zone System
- Zone definitions
- Instance management
- Spawn points
- World events

### Networking/Multiplayer
- Server architecture
- Client-server protocol
- Multiplayer synchronization
- Network optimization

### Persistence
- Database schema
- Save/load systems
- Migration tools
- Backup/recovery

### Godot Integration
- Godot plugin
- Godot editor extensions
- Runtime Godot components
- Godot-specific tooling

### Plugin SDK
- Plugin API
- Third-party extensions
- Mod support
- Custom schema extensions

### Advanced Validation
- Custom validation rules
- Rule engine
- Conditional validation beyond JSON Schema
- Performance benchmarking

### Release/Packaging
- Distribution builds
- Release automation
- Version management
- Changelog generation

### Documentation
- API documentation (runtime)
- Architecture decision records (ADRs)
- Design documents for future features
- Marketing materials

## Explicitly Not Planned

### Cross-Project Integration
- Project Avalon integration
- Migration from other systems
- Import/export tools for other formats

### Cloud/SaaS
- Hosted services
- Cloud infrastructure
- SaaS offerings

### Mobile-Specific
- Mobile UI
- Touch controls
- Mobile optimization

## What This Means

If you need any of the above features:

1. **Wait for future waves** — Many features are planned for Wave 2+
2. **Build on top** — Wave 1 provides the foundation; extend as needed
3. **Contribute** — Propose additions through the governance process

## Wave 1 IS Complete

Wave 1 provides a solid foundation:
- ✅ Item schemas
- ✅ Reward schemas
- ✅ Validator
- ✅ CLI
- ✅ Fixtures

This is intentional scope containment. Future waves will build upon this foundation.

## See Also

- [README.md](../README.md) — What's in Wave 1
- W1-PLAN-001-decomposition.md — Task breakdown
- [Getting Started](getting-started.md) — How to use Wave 1
