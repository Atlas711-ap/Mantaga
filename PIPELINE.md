# Mantaga Pipeline - Complete Task List

## Mission
Build an AI-powered e-commerce operations company in UAE achieving **1M AED revenue** (10M AED sales at 10% commission).

---

## Phase 1: Foundation (COMPLETED ✅)
- [x] Auth system (login, password, profile, logout)
- [x] Dashboard UI with sidebar
- [x] Settings page
- [x] Basic agent framework structure

---

## Phase 2: AI Agents Setup

### 2.1 Agent Configuration
| Task | Agent | Status |
|------|-------|--------|
| Configure Athena as main agent (MiniMax M2.5) | Athena | ⚠️ Needs config |
| Configure Nexus as sub-agent (Qwen 32B) | Nexus | ⚠️ Needs config |
| Configure Atlas as sub-agent (Qwen 32B) | Atlas | ⚠️ Needs config |
| Configure Forge as sub-agent (Qwen 32B) | Forge | ⚠️ Needs config |

### 2.2 Agent Communication
| Task | Status |
|------|--------|
| Set up sub-agent spawning in OpenClaw | ⚠️ Needs setup |
| Configure Telegram channel for Athena → Anush alerts | ⚠️ Needs setup |
| Build Agent Chat Room integration | ⚠️ Needs setup |

---

## Phase 3: Data Pipeline

### 3.1 CSV Upload & Processing
| Task | Status |
|------|--------|
| Upload page UI | ✅ Built |
| CSV parser (Talabat format) | ⚠️ Needs build |
| Auto-detect platform (Talabat/Amazon/Noon/Careem) | ⚠️ Needs build |
| Data validation (Atlas role) | ⚠️ Needs build |
| Store in Convex (daily_stock_snapshot) | ⚠️ Needs build |

### 3.2 Stock Analysis
| Task | Status |
|------|--------|
| OOS detection (0 stock) | ⚠️ Needs build |
| Low stock alerts (<3 units) | ⚠️ Needs build |
| Velocity calculation (Nexus role) | ⚠️ Needs build |
| Replenishment forecasting | ⚠️ Needs build |

### 3.3 Alert Flow
```
CSV Upload → Atlas validates → Nexus analyzes → Athena decides → Telegram alert to Anush
```

---

## Phase 4: Business Operations

### 4.1 LPO Management
| Task | Status |
|------|--------|
| LPO creation form | ⚠️ Needs build |
| LPO tracking (delivery dates) | ⚠️ Needs build |
| LPO status (pending/partial/complete) | ⚠️ Needs build |

### 4.2 Commission Tracking
| Task | Status |
|------|--------|
| Brand performance table | ⚠️ Needs build |
| Commission calculation (10%) | ⚠️ Needs build |
| Invoice matching | ⚠️ Needs build |
| Monthly revenue report | ⚠️ Needs build |

### 4.3 Brand/Customer Metrics
| Task | Status |
|------|--------|
| Brand performance page | ⚠️ Needs build |
| Customer performance page | ⚠️ Needs build |
| MTD/YTD dashboards | ⚠️ Needs build |

---

## Phase 5: Automation

### 5.1 Email Integration (Future)
| Task | Status |
|------|--------|
| Auto-download CSV from email | 🔜 Future |
| Auto-upload to dashboard | 🔜 Future |

### 5.2 Scheduled Tasks
| Task | Status |
|------|--------|
| Daily stock report at 9 AM | 🔜 Future |
| Weekly summary to Telegram | 🔜 Future |
| Monthly commission report | 🔜 Future |

---

## Priority Order (What to Build Next)

### IMMEDIATE (This Week)
1. **CSV Upload Flow** - Get data into the system
2. **Stock Alert Logic** - Detect OOS/low stock
3. **Telegram Alert** - Athena → Anush when action needed

### SHORT-TERM (2-4 weeks)
4. **LPO Tracking** - Manage purchase orders
5. **Agent Sub-routines** - Set up Nexus/Atlas/Forge properly
6. **Brand Performance** - Commission tracking

### MEDIUM-TERM (1-2 months)
7. **Email Automation** - Auto-download CSVs
8. **Multi-platform support** - Amazon, Noon, Careem
9. **Advanced Analytics** - Velocity, forecasting

---

## Current Workflow (MVP)

```
1. Anush receives CSV from Talabat/Amazon/Noon
2. Anush uploads CSV to dashboard
3. System validates and stores data
4. Dashboard shows stock alerts
5. (Future: Athena analyzes → Telegram alert)
```

---

## Files & Locations

| Component | Path |
|-----------|------|
| Dashboard | `~/Mantaga/mission-control-dashboard/` |
| Agent Framework | `~/Mantaga/agent-framework/` |
| OpenClaw Config | `~/.openclaw/openclaw.json` |
| Convex DB | `~/Mantaga/mission-control-dashboard/convex/` |

---

*Last Updated: 2026-02-22*
