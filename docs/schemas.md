# OpenMMO Schemas

This document describes the Wave 1 schemas for items and rewards.

## Overview

| Schema | Purpose | File |
|--------|---------|------|
| **ID** | Entity identifier format | `id.schema.json` |
| **Reference** | Cross-entity references | `reference.schema.json` |
| **Item** | Game items | `item.schema.json` |
| **Reward** | Reward definitions | `reward.schema.json` |

## ID Schema

### Format

All entity IDs follow the pattern: `{category}_{local_id}`

**Examples:**
- `item_iron_sword`
- `reward_gold_chest`
- `currency_gold`

### Rules

- Must start with lowercase letter
- Category: 2-16 characters
- Separator: single underscore
- Local ID: 1-47 characters
- Total length: 4-64 characters
- Only lowercase letters, numbers, and underscores

### Valid IDs

```
item_iron_sword
reward_daily_bonus
currency_gold
ab_x
```

### Invalid IDs

```
item_           # Empty local ID
ITEM_SWORD      # Uppercase
item__sword     # Double underscore
iron_sword      # Missing category
```

## Reference Schema

References link entities together. They use the same format as IDs.

### Usage in Items

```json
{
  "id": "item_health_potion",
  "on_use_reward": "reward_heal_small"
}
```

### Usage in Rewards

```json
{
  "id": "reward_potion_drop",
  "items": [
    { "item": "item_health_potion", "quantity": 1 }
  ]
}
```

### Reference Rules

- Items can reference rewards (via `on_use_reward`)
- Rewards can reference items (via `items` array)
- References must use valid ID format

## Item Schema

### Required Fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique identifier (item_* format) |
| `name` | string | Display name (1-100 chars) |
| `item_type` | enum | Type: consumable, equipment, material, quest |

### Item Types

| Type | Description | Key Fields |
|------|-------------|------------|
| **consumable** | Usable items | `on_use_reward`, `destroy_on_use` |
| **equipment** | Wearable gear | `equipment_slot`, `stats` |
| **material** | Crafting resources | `stackable`, `max_stack_size` |
| **quest** | Quest-related | `quest_binding` |

### Equipment Slots

- `head` — Helmet, hat
- `chest` — Armor, tunic
- `legs` — Pants, greaves
- `feet` — Boots, shoes
- `hands` — Gloves, gauntlets
- `main_hand` — Sword, staff
- `off_hand` — Shield, orb
- `neck` — Amulet, necklace
- `ring` — Ring
- `trinket` — Misc. accessory

### Item Example (Equipment)

```json
{
  "id": "item_iron_sword",
  "name": "Iron Sword",
  "description": "A sturdy sword",
  "item_type": "equipment",
  "equipment_slot": "main_hand",
  "rarity": "common",
  "level_requirement": 5,
  "stats": {
    "damage": 12,
    "strength": 2
  }
}
```

### Item Example (Consumable)

```json
{
  "id": "item_health_potion",
  "name": "Health Potion",
  "item_type": "consumable",
  "stackable": true,
  "max_stack_size": 20,
  "on_use_reward": "reward_heal_small",
  "destroy_on_use": true
}
```

### Item Fields

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `id` | string | ✅ | — | Unique ID |
| `name` | string | ✅ | — | Display name |
| `description` | string | — | — | Description (max 500) |
| `item_type` | enum | ✅ | — | Type category |
| `icon` | string | — | — | Icon identifier |
| `stackable` | boolean | — | false | Can stack |
| `max_stack_size` | integer | — | 1 | Max per stack |
| `rarity` | enum | — | common | common/uncommon/rare/epic/legendary |
| `level_requirement` | integer | — | — | Min level (1-100) |
| `equipment_slot` | enum | Conditional* | — | Required for equipment |
| `stats` | object | — | — | Stat modifiers |
| `on_use_reward` | reference | — | — | Reward granted on use |
| `quest_binding` | boolean | — | false | Quest-bound |
| `destroy_on_use` | boolean | — | false | Consumed on use |
| `sellable` | boolean | — | true | Can sell |
| `tags` | string[] | — | [] | Categorization |

\* Required when `item_type` is "equipment"

## Reward Schema

### Required Fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique identifier (reward_* format) |
| `name` | string | Display name |

Plus at least one of:
- `items` — Item rewards
- `currency` — Currency rewards
- `experience` — Experience rewards

### Reward Content Types

#### Items

```json
{
  "items": [
    { "item": "item_iron_sword", "quantity": 1 },
    { "item": "item_health_potion", "quantity": 5 }
  ]
}
```

#### Currency

```json
{
  "currency": [
    { "currency_type": "gold", "amount": 100 },
    { "currency_type": "premium", "amount": 10 }
  ]
}
```

**Currency Types:** gold, premium, honor_points, reputation

#### Experience

```json
{
  "experience": [
    { "experience_type": "character", "amount": 500 },
    { "experience_type": "skill", "amount": 100 }
  ]
}
```

**Experience Types:** character, skill, profession

### Reward Example

```json
{
  "id": "reward_boss_drop",
  "name": "Boss Drop",
  "description": "Epic rewards",
  "items": [
    { "item": "item_gold_ring", "quantity": 1 }
  ],
  "currency": [
    { "currency_type": "gold", "amount": 1000 }
  ],
  "experience": [
    { "experience_type": "character", "amount": 2000 }
  ],
  "reward_type": "loot"
}
```

### Reward Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | ✅ | Unique ID |
| `name` | string | ✅ | Display name |
| `description` | string | — | Description |
| `items` | array | Conditional | Item rewards (max 10) |
| `currency` | array | Conditional | Currency rewards (max 5) |
| `experience` | array | Conditional | Experience rewards (max 3) |
| `reward_type` | enum | — | loot/quest/crafting/vendor/achievement |
| `tags` | string[] | — | Categorization |

## Validation

All schemas are validated using JSON Schema Draft 2020-12.

```bash
# Validate an item
openmmo validate my_item.json

# Validate a reward
openmmo validate my_reward.json
```

## Schema Files

| File | Schema ID |
|------|-----------|
| `Schemas/id.schema.json` | `openmmo://schemas/id.schema.json` |
| `Schemas/reference.schema.json` | `openmmo://schemas/reference.schema.json` |
| `Schemas/item.schema.json` | `openmmo://schemas/item.schema.json` |
| `Schemas/reward.schema.json` | `openmmo://schemas/reward.schema.json` |
