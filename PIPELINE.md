# Mantaga Roadmap - AI Agent Operations

## Mission
Replace 7-human team with 4 AI Agents + 1 CEO (Anush)

---

## AI Agent Team

```
CEO (Anush)
    │
    ├── ATHENA (CEO Agent) - MiniMax M2.5
    │   ├── Heartbeat: 30 min
    │   └── Cron: Daily brief (1 AM), EOD summary
    │
    ├── NEXUS (Trade Marketing) - Qwen 32B
    │   ├── Heartbeat: Weekly
    │   └── Cron: Monthly reports, budget cycles
    │
    ├── ATLAS (Ecommerce) - Qwen 32B
    │   ├── Heartbeat: Daily
    │   └── Cron: Process uploads, validate SKUs
    │
    └── FORGE (Supply Chain + Ads) - Qwen 32B
        ├── Heartbeat: Weekly
        └── Cron: Ad performance, inventory forecast
```

---

## Agent Heartbeats & Cron Jobs

### ATHENA (CEO)
| Task | Frequency | Trigger |
|------|-----------|----------|
| Heartbeat | Every 30 min | Check for issues |
| Morning Brief | 1 AM daily | Telegram to Anush |
| EOD Summary | 8 PM daily | Telegram to Anush |
| Escalation | On demand | When sub-agent needs decision |

### NEXUS (Trade Marketing)
| Task | Frequency | Trigger |
|------|-----------|----------|
| Heartbeat | Weekly | Revenue vs forecast |
| Monthly Report | 1st of month | Commission calculation |
| Budget Review | On LPO | When new LPO uploaded |

### ATLAS (Ecommerce)
| Task | Frequency | Trigger |
|------|-----------|----------|
| Heartbeat | Daily | Stock levels check |
| Process Upload | On upload | CSV/Excel uploaded |
| SKU Validation | On upload | Check barcode/product |
| Stock Alert | On upload | If OOS detected |

### FORGE (Supply Chain)
| Task | Frequency | Trigger |
|------|-----------|----------|
| Heartbeat | Weekly | Inventory forecast |
| Ad Report | Weekly | PPC performance |
| Reorder Suggest | On stock alert | When low stock |

---

## Progressive Build

### Phase 1: Core (This Week)
- [ ] Test LPO fixes
- [ ] Upload Stock CSV → Stock Alerts on dashboard
- [ ] Update Team tab (agent cards with roles)

### Phase 2: Chatroom (Month 1)
- [ ] Build Chatroom with @tag support
- [ ] All agents see messages
- [ ] @tag routes to specific agent

### Phase 3: Agent Automation (Month 1-2)
- [ ] Atlas: Process uploads automatically
- [ ] Atlas: Stock alerts
- [ ] Nexus: Revenue reports
- [ ] Forge: Ad reports

### Phase 4: Full Autonomy (Month 2+)
- [ ] All agents running 24/7
- [ ] Heartbeats active
- [ ] Cron jobs scheduled
- [ ] Self-healing workflows

---

*Last Updated: 2026-02-22*
