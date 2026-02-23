# AGENTS.md - Mantaga AI Team

## 7-Agent Structure

| Level | Agent | Role | Reports To | Status |
|-------|-------|------|------------|--------|
| 1 | Athena | CEO Agent | Anush | ACTIVE |
| 2 | Nexus | Trade Marketing Manager | Athena | ACTIVE |
| 2 | Atlas | Ecommerce KAM | Athena | ACTIVE |
| 2 | Forge | Supply Chain Manager | Athena | ACTIVE |
| 2 | Neo | IT Manager | Athena | IDLE |
| 2 | Zeus | Marketing Manager | Athena | IDLE |
| 3 | Faith | Ecommerce Coordinator | Atlas | IDLE |
| 3 | Alexis | Performance Marketing | Atlas | IDLE |

## Agent Details

### Athena - CEO Agent
- **Role:** Executive Decision Maker
- **Mission:** Coordinate AI agents, daily summaries to Anush
- **Model:** MiniMax M2.5

### Nexus - Trade Marketing Manager
- **Role:** Sales & Budget Manager
- **Mission:** Targets vs actual, marketing budgets (≤20%)
- **Model:** Qwen 32B

### Atlas - Ecommerce KAM
- **Role:** Customer & Stock Manager
- **Mission:** Customer insights, ads performance, stock movement
- **Model:** Qwen 32B
- **Manages:** Faith, Alexis

### Forge - Supply Chain Manager
- **Role:** Forecasting
- **Mission:** SKU volume forecasting → Nexus for targets
- **Model:** Qwen 32B

### Neo - IT Manager
- **Role:** Tool Builder
- **Mission:** Build tools and skills for team
- **Model:** Qwen 32B

### Zeus - Marketing Manager
- **Role:** Brand & Acquisition
- **Mission:** Digital marketing, brand marketing, client acquisition
- **Model:** Qwen 32B

### Faith - Ecommerce Coordinator
- **Role:** SKU Data Manager
- **Mission:** Master SKU List, stock reports → Atlas
- **Model:** Qwen 32B

### Alexis - Performance Marketing
- **Role:** PPC Manager
- **Mission:** Talabat PPC → insights for Atlas
- **Model:** Qwen 32B

---

*Last Updated: 2026-02-23*
