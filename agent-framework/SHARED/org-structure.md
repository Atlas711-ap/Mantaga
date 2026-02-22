# Mantaga AI Organization Structure

```
CEO (Anush)
    │
    └── ATHENA (CEO Agent)
            │
            ├── NEXUS (Trade Marketing Manager)
            │       └── Reports: sales vs forecast, budget analysis
            │
            ├── ATLAS (Ecommerce Key Account Manager)
            │       │
            │       ├── Ecommerce Coordinator (sub-agent)
            │       │       └── Master SKU, stock movement analysis
            │       │
            │       └── Performance Marketing Coordinator (sub-agent)
            │               └── PPC ads data, analysis
            │
            └── FORGE (Supply Chain Manager)
                    └── Volume forecast by SKU, brand, client
```

---

## Hierarchy

| Level | Role | Reports To |
|-------|------|------------|
| 1 | Anush (CEO) | - |
| 2 | Athena (CEO Agent) | Anush |
| 3 | Nexus (Trade Marketing Manager) | Athena |
| 3 | Atlas (Ecom KAM) | Athena |
| 3 | Forge (Supply Chain) | Athena |
| 4 | Ecommerce Coordinator | Atlas |
| 4 | Performance Marketing Coordinator | Atlas |

---

## Data Flow

```
Stock Report Upload
        ↓
   Ecommerce Coordinator (Atlas team)
        ↓
   Analyzes stock movement
        ↓
   ATLAS makes sense of data → Brand performance by customer
        ↓
        ├→ FORGE: Build volume forecast (SKU × brand × client)
        │
        └→ NEXUS: Analyze sales vs forecast + budget spends
                  ↓
        ATLAS + NEXUS + FORGE meet → Discuss volume vs targets
                  ↓
        ATHENA → Decision → Telegram to Anush
```

---

## Each Role

### NEXUS (Trade Marketing Manager)
- Sales vs forecast analysis
- Budget spend analysis (on-app marketing + promotions)
- Reports to Athena

### ATLAS (Ecommerce Key Account Manager)
- Coordinates Ecommerce Coordinator + Performance Marketing Coordinator
- Brand performance by customer analysis
- Reports to Athena

#### Ecommerce Coordinator (under Atlas)
- Master SKU list management
- Stock movement analysis

#### Performance Marketing Coordinator (under Atlas)
- PPC ads data management
- Analysis

### FORGE (Supply Chain Manager)
- Volume forecast (full year by SKU × brand × client)
- Uses micro/macro events
- Reports to Athena

---

## Discussion Meetings

Atlas, Nexus, and Forge "meet" regularly to discuss:
- Volume forecast vs targets
- Brand performance
- Budget alignment

Athena coordinates these discussions and escalates to Anush.

---

*Last Updated: 2026-02-22*
