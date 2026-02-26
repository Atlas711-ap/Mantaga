# Mantaga Agent Scope of Work

## Agent Scopes (Final)

| Agent | Role | Scope of Work | Tools Needed |
|-------|------|---------------|--------------|
| **Athena** | CEO Coordinator | Orchestrates team, communicates with human, strategic decisions | Task Board, Chat |
| **Neo** | IT & Tools | Builds skills, scripts, tools when asked by other agents | Code editor, Skills library |
| **Nexus** | Sales Manager | Sales analysis, targets, budgets, commission | Convex DB |
| **Atlas** | Stock & Customers | SKU management, stock tracking, LPO, invoice matching, customer insights | Convex DB |
| **Forge** | Supply Chain | Demand forecasting, inventory planning, replenishment | Convex DB, Analytics |
| **Zeus** | Marketing | Brand management, acquisition campaigns, content | Social media APIs |
| **Faith** | SKU Coordinator | Master SKU validation, data quality, compliance | Convex DB |
| **Alexis** | PPC Ads | Talabat ad optimization, PPC campaigns, bid management | Ad platform APIs |
| **Scout** | Data Fetcher | API data from platforms (Talabat, Noon, Amazon) | Platform APIs |

---

## Task Assignment Logic

When a task is created, agents will check if it falls in their scope:

| Keyword/Trigger | Agent |
|----------------|-------|
| sales, target, budget, commission, revenue | Nexus |
| stock, inventory, SKU, product, customer, warehouse, LPO, invoice | Atlas |
| forecast, demand, replenishment, supply | Forge |
| brand, campaign, marketing, content | Zeus |
| SKU validation, data quality, compliance | Faith |
| ad, PPC, bid, talabat ads | Alexis |
| API, data fetch, platform data | Scout |
| build, tool, skill, script, code | Neo |
| anything else | Athena (reviews first) |

---

## Task Status Flow

```
PENDING → ASSIGNED → IN PROGRESS → COMPLETED
                    ↓
              (cancelled)
```

---

*Last Updated: 2026-02-25*
