# MANTAGA - COMPANY & TECHNICAL DOCUMENTATION

**Document Version:** 1.0  
**Last Updated:** February 27, 2026  
**Prepared For:** Anush Prabhu, Founder & CEO  

---

# TABLE OF CONTENTS

1. [Company Overview](#1-company-overview)
2. [Business Model](#2-business-model)
3. [AI Agent Architecture](#3-ai-agent-architecture)
4. [Technical Infrastructure](#4-technical-infrastructure)
5. [Mission Control Dashboard](#5-mission-control-dashboard)
6. [Data Architecture](#6-data-architecture)
7. [Operational Workflows](#7-operational-workflows)
8. [Security & Access](#8-security--access)
9. [Future Roadmap](#9-future-roadmap)

---

# 1. COMPANY OVERVIEW

## 1.1 Company Profile

| Field | Details |
|-------|---------|
| **Company Name** | Mantaga |
| **Legal Entity** | Delivery Hero Stores DB LLC |
| **Registration** | TRN: 100608487300003 |
| **Address** | PO Box 36728, Bur Dubai, Al Wasl City walk mall, Building B03, Dubai, UAE |
| **Industry** | E-commerce Operations / F&B Distribution |
| **Business Model** | AI-powered e-commerce operations management |

## 1.2 Business Focus

Mantaga operates as an AI-powered e-commerce operations company in the UAE, managing product distribution across major delivery platforms. The company leverages AI agents to automate and optimize various operational tasks including inventory management, purchase order processing, sales tracking, and performance analytics.

## 1.3 Revenue Model

| Metric | Value |
|--------|-------|
| **Monthly Revenue Target** | 1,000,000 AED |
| **Monthly Sales Target** | 10,000,000 AED |
| **Commission Rate** | 10% on sales |

## 1.4 Distribution Partners (Distributors)

| Distributor | Status |
|-------------|--------|
| Quadrant | Active |
| Expand Mena | Active |
| 5ACE | Active |
| Alami Foods | Active |

## 1.5 Sales Channels (Platforms)

| Platform | Status |
|----------|--------|
| Talabat | Active |
| Amazon | Active |
| Noon | Active |
| Careem | Active |

## 1.6 Market Context

- **Region:** UAE (Middle East)
- **Languages:** Arabic, English
- **Seasonality:** Peak seasons Q2-Q3 (Ramadan, Eid)

---

# 2. BUSINESS MODEL

## 2.1 Value Chain

```
SUPPLIER → MANTAGA (Operations AI) → DISTRIBUTORS → PLATFORMS → CUSTOMERS
                                              ↓
                                    Talabat, Amazon, Noon, Careem
```

## 2.2 Operational Flow

1. **Order Generation:** Purchase Orders (LPOs) received from platforms
2. **Processing:** AI agents parse, validate, and process orders
3. **Fulfillment:** Stock allocation and delivery coordination
4. **Invoicing:** Invoice matching and reconciliation
5. **Reporting:** Performance analytics and commission tracking

## 2.3 Key Business Processes

| Process | Description |
|---------|-------------|
| LPO Processing | Parse PDF/Excel orders from distributors |
| Stock Management | Daily stock snapshots, SOH tracking |
| Invoice Matching | Match invoices with LPOs |
| Brand Performance | Track sales, service levels, commissions |
| SKU Management | Master SKU validation and updates |

---

# 3. AI AGENT ARCHITECTURE

## 3.1 Agent Team Overview

Mantaga operates a **9-agent AI team** designed after the "Mission Control" architecture. Each agent has a specific role and responsibility.

### Agent Hierarchy

```
                    ┌─────────────────┐
                    │     ANUSH       │
                    │   (Human CEO)   │
                    └────────┬────────┘
                             │
                    ┌────────▼────────┐
                    │     ATHENA       │
                    │   (CEO Agent)    │
                    │  MiniMax M2.5    │
                    └────────┬────────┘
                             │
         ┌───────────────────┼───────────────────┐
         │                   │                   │
    ┌────▼────┐        ┌────▼────┐        ┌────▼────┐
    │  NEXUS  │        │  ATLAS  │        │  FORGE  │
    │ Sales   │        │ Stock   │        │Supply   │
    │ Manager │        │ & Ads   │        │ Chain   │
    └────┬────┘        └────┬────┘        └────┬────┘
         │                   │                   │
    ┌────▼────┐        ┌────▼────┐        ┌────▼────┐
    │  ZEUS   │        │  NEO    │        │  FAITH  │
    │Marketing│        │   IT    │        │   SKU   │
    └────┬────┘        └────┬────┘        └────┬────┘
         │                   │                   │
    ┌────▼───────────────────▼───────────────────▼────┐
    │              SCOUT (Data Fetcher)             │
    │              qwen2.5-vl:32b                   │
    └──────────────────────────────────────────────┘
```

## 3.2 Agent Specifications

### ATHENA (CEO Agent - Orchestrator)

| Attribute | Details |
|-----------|---------|
| **Role** | CEO / Orchestrator |
| **Model** | MiniMax M2.5 |
| **Primary Function** | Synthesis, orchestration, human interface, sub-agent oversight |
| **Key Files** | soul.md, principles.md, memory.md |
| **Personality** | Strategic, direct, data-driven, proactive |
| **Communication** | Sole interface with human user (Anush) |

### NEXUS (Trade Marketing Manager)

| Attribute | Details |
|-----------|---------|
| **Role** | Sales data, targets, budgets, distributor performance |
| **Model** | qwen3.5:35b |
| **Primary Function** | Trade Marketing, sales analysis |
| **Key Files** | soul.md, principles.md, memory.md |

### ATLAS (Ecommerce KAM)

| Attribute | Details |
|-----------|---------|
| **Role** | Stock levels, customer data, ad performance |
| **Model** | qwen3.5:35b |
| **Primary Function** | Key Account Management, inventory tracking |
| **Key Files** | soul.md, principles.md, memory.md |

### FORGE (Supply Chain Manager)

| Attribute | Details |
|-----------|---------|
| **Role** | Demand forecasting, inventory predictions |
| **Model** | qwen3.5:35b |
| **Primary Function** | Supply chain optimization |
| **Key Files** | soul.md, principles.md, memory.md |

### NEO (IT Manager)

| Attribute | Details |
|-----------|---------|
| **Role** | Dashboard, API integrations, automation |
| **Model** | qwen2.5-coder:32b |
| **Primary Function** | Tool building, technical implementation |
| **Key Files** | soul.md, principles.md, memory.md |

### ZEUS (Marketing Manager)

| Attribute | Details |
|-----------|---------|
| **Role** | Brand strategy, acquisition |
| **Model** | MiniMax M2.5 |
| **Primary Function** | Marketing strategy |
| **Key Files** | soul.md, principles.md, memory.md |

### FAITH (SKU Coordinator)

| Attribute | Details |
|-----------|---------|
| **Role** | SKU validation, data quality, reporting |
| **Model** | qwen3.5:35b |
| **Primary Function** | Data quality assurance |
| **Key Files** | soul.md, principles.md, memory.md |

### ALEXIS (Performance Marketing)

| Attribute | Details |
|-----------|---------|
| **Role** | PPC optimization, ad spend |
| **Model** | qwen3.5:35b |
| **Primary Function** | Ad optimization |
| **Key Files** | soul.md, principles.md, memory.md |

### SCOUT (Data Fetcher)

| Attribute | Details |
|-----------|---------|
| **Role** | API data collection, research |
| **Model** | qwen2.5-vl:32b |
| **Primary Function** | Data gathering, research |
| **Key Files** | soul.md, principles.md, memory.md |

## 3.3 Communication Protocols

### Task Assignment Format
```
TASK_ASSIGNMENT: from Athena → Sub-agent
Fields: task_id, scope, data_sources, output_format, deadline
```

### Task Delivery Format
```
TASK_DELIVERY: from Sub-agent → Athena
Fields: task_id, output, data_gaps, confidence_level
```

### Feedback Format
```
FEEDBACK: from Athena → Sub-agent
Fields: task_id, positive_notes, constructive_notes, required_changes
```

## 3.4 Escalation Triggers

Athena automatically escalates to human without waiting:
- System downtime
- Data pipeline failures
- Agent task failures (3+ consecutive)
- Significant metric deviations (>20% vs target)
- Any request outside defined scope

---

# 4. TECHNICAL INFRASTRUCTURE

## 4.1 Technology Stack

| Component | Technology | Version/Details |
|-----------|-------------|------------------|
| **Frontend** | Next.js | React framework |
| **Database** | Convex | Real-time database |
| **AI Models** | MiniMax M2.5, Qwen 3.5 35b | LLM inference |
| **Server** | Ollama on GB10 | Local model hosting |
| **Hosting** | Vercel | Frontend deployment |
| **Framework** | OpenClaw | AI agent orchestration |

## 4.2 Deployment URLs

| Service | URL |
|---------|-----|
| **Dashboard** | https://mantaga.vercel.app |
| **Convex Database** | https://grand-rhinoceros-575.convex.cloud |
| **Ollama Server** | http://100.126.131.51:11434 |

## 4.3 Repository

| Repository | URL |
|------------|-----|
| **Mantaga** | https://github.com/Atlas711-ap/Mantaga |

---

# 5. MISSION CONTROL DASHBOARD

## 5.1 Dashboard Modules

The Mission Control Dashboard is built with Next.js and Convex, providing real-time visibility into all business operations.

### Available Tabs

| Tab | Purpose |
|-----|---------|
| **Dashboard** | Overview, KPIs, quick stats |
| **Task Board** | Agent task management |
| **Team** | Agent status and performance |
| **Upload** | Excel/PDF data upload (LPOs, Stock) |
| **LPO** | Purchase Order management |
| **SKU List** | Master SKU database |
| **Brand Performance** | Sales, service level, commissions |
| **Customer Performance** | Stock by customer/DS |
| **Settings** | Configuration |

## 5.2 Upload Features

### Excel Upload (LPO)

**Headers:**
```
sku_id, po_number, supplier_name, po_creation_date, po_receiving_date, 
po_status, sent_to_supplier_on, supplier_rejection_reason, 
supplier_acknowledgement_status, channel_name, supplier_sku, product_name, 
barcode, qty, unit_cost, net_cost_excl_vat, vat_5_percent, total_incl_vat
```

**Processing:**
- Groups by PO number
- Creates header in lpo_table
- Creates line items in lpo_line_items
- Derives brand/client from master SKU by barcode

### PDF Parsing

- Converts PDF to images client-side
- Uses OpenAI GPT-4V for parsing
- Extracts structured data to Convex

## 5.3 Brand Performance Metrics

| Metric | Calculation |
|--------|-------------|
| **Total LPO Value** | Sum of LPO value incl. VAT |
| **Total Invoiced** | Sum of invoiced value incl. VAT |
| **Commission** | Total invoiced × commission % |
| **Service Level** | Total Invoiced ÷ Total LPO Value × 100 |

### Time Periods

| Period | Definition |
|--------|------------|
| **Filtered** | Based on selected filters |
| **MTD** | Current month (Feb 2026) |
| **YTD** | Current year (2026) |

---

# 6. DATA ARCHITECTURE

## 6.1 Database Tables (Convex)

### master_sku
Master SKU database with platform-specific identifiers.

| Field | Type | Description |
|-------|------|-------------|
| client | string | Client/brand owner |
| brand | string | Brand name |
| barcode | string | Product barcode |
| sku_name | string | Product name |
| category | string | Product category |
| talabat_sku | string | Talabat SKU ID |
| amazon_asin | string | Amazon ASIN |
| noon_zsku | string | Noon ZSKU |
| careem_code | string | Careem product code |
| talabat_ptt | number | Price to Trade - Talabat |
| amazon_ptt | number | Price to Trade - Amazon |
| noon_ptt | number | Price to Trade - Noon |
| careem_ptt | number | Price to Trade - Careem |
| mantaga_commission_pct | number | Commission % |

### daily_stock_snapshot
Daily stock levels per warehouse.

| Field | Type | Description |
|-------|------|-------------|
| report_date | string | Snapshot date |
| sku_id | string | SKU identifier |
| barcode | string | Product barcode |
| product_name | string | Product name |
| warehouse_name | string | Warehouse identifier |
| warehouse_type | string | Type (3PL, DS, etc.) |
| stock_on_hand | number | Current stock |
| putaway_reserved_qty | number | Reserved quantity |
| effective_stock | number | Available stock |

### lpo_table
Purchase Order headers.

| Field | Type | Description |
|-------|------|-------------|
| po_number | string | PO number |
| order_date | string | PO creation date (YYYY-MM-DD) |
| delivery_date | string | Expected delivery |
| supplier | string | Supplier name |
| delivery_location | string | Delivery address |
| customer | string | Channel (Talabat, etc.) |
| total_excl_vat | number | Subtotal |
| total_vat | number | VAT amount |
| total_incl_vat | number | Grand total |
| status | string | PO status |
| commission_pct | number | Commission % |
| commission_amount | number | Commission AED |

### lpo_line_items
Purchase Order line items.

| Field | Type | Description |
|-------|------|-------------|
| po_number | string | Link to PO |
| barcode | string | Product barcode |
| product_name | string | Product name |
| brand | string | Brand (from SKU) |
| client | string | Client (from SKU) |
| quantity_ordered | number | Ordered qty |
| quantity_delivered | number | Delivered qty |
| unit_cost | number | Unit price AED |
| amount_excl_vat | number | Line total excl. VAT |
| vat_pct | number | VAT % (usually 5) |
| vat_amount | number | VAT amount |
| amount_incl_vat | number | Line total incl. VAT |
| amount_invoiced | number | Invoiced amount |
| vat_amount_invoiced | number | VAT on invoice |
| total_incl_vat_invoiced | number | Invoice total |
| invoice_number | string | Invoice reference |
| invoice_date | string | Invoice date |

### invoice_table
Invoice records.

| Field | Type | Description |
|-------|------|-------------|
| invoice_number | string | Invoice number |
| invoice_date | string | Invoice date |
| po_number | string | Linked PO |
| customer | string | Customer name |
| subtotal | number | Before VAT |
| vat_amount | number | VAT |
| grand_total | number | Total incl. VAT |

### brand_performance
Derived view for analytics.

| Field | Type | Description |
|-------|------|-------------|
| year | number | From invoice_date |
| month | number | From invoice_date |
| po_number | string | PO reference |
| po_date | string | PO date |
| customer | string | Channel |
| brand | string | Brand |
| client | string | Client |
| invoice_number | string | Invoice |
| invoice_date | string | Invoice date |
| barcode | string | Product barcode |
| product_name | string | Product |
| quantity_ordered | number | Ordered |
| quantity_delivered | number | Delivered |
| unit_cost | number | Unit price |
| lpo_value_incl_vat | number | PO value |
| invoiced_value_incl_vat | number | Invoiced |
| gap_value | number | Shortfall |
| service_level_pct | number | Service % |
| commission_pct | number | Commission % |
| commission_aed | number | Commission AED |

---

# 7. OPERATIONAL WORKFLOWS

## 7.1 Daily Stock Upload Flow

```
1. Export stock report from system
2. Upload Excel to Dashboard (Upload tab)
3. System parses and updates daily_stock_snapshot
4. Customer Performance tab updates automatically
```

## 7.2 LPO Processing Flow

```
1. Receive LPO from distributor (PDF/Excel)
2. Upload to Dashboard (Upload tab)
3. System extracts:
   - PO header → lpo_table
   - Line items → lpo_line_items
   - Brand/Client → matched from master_sku by barcode
4. Review in LPO tab
5. Enter invoice details (qty delivered, invoice number, date)
6. Click "Sync to Brand Performance"
7. Data appears in Brand Performance tab
```

## 7.3 Brand Performance Reporting Flow

```
1. Filter by year/month/brand/client
2. View filtered metrics:
   - Total LPO Value
   - Total Invoiced
   - Commission
   - Service Level
3. Compare with MTD/YTD widgets
4. Export for reporting
```

---

# 8. SECURITY & ACCESS

## 8.1 Security Model

Based on OpenClaw's personal assistant security model:

- **Single trusted operator:** Anush (CEO)
- **AI agents operate within defined permissions**
- **No public access to dashboard**
- **Telegram bot for commands**

## 8.2 Current Security Status

| Check | Status |
|-------|--------|
| Gateway bind | Loopback only ✅ |
| Credentials | Need chmod 700 ⚠️ |
| Sandbox | Disabled (needs hardening) ⚠️ |
| Web tools | Enabled on small models ⚠️ |

### Recommended Fixes

1. `chmod 700 ~/.openclaw/credentials`
2. Enable sandboxing for agents
3. Restrict Telegram DMs to specific users

---

# 9. FUTURE ROADMAP

## 9.1 Planned Enhancements

| Feature | Priority | Description |
|---------|----------|-------------|
| Auto-invoicing | High | AI-generated invoices from LPOs |
| Demand Forecasting | High | ML-based forecasting |
| Multi-channel Sync | Medium | Real-time platform integration |
| WhatsApp Bot | Medium | Alternative command interface |
| Analytics Dashboard | Medium | Advanced BI features |

## 9.2 Scalability Considerations

- Add more distributors
- Expand to new platforms (Amazon Fresh, Carrefour)
- Regional expansion (Saudi, Qatar)
- B2B portal for suppliers

---

# APPENDIX: QUICK REFERENCE

## Key Contacts

| Role | Name | Platform |
|------|------|----------|
| CEO | Anush Prabhu | - |
| AI Orchestrator | Athena | Telegram |

## Important Links

| Service | URL |
|--------|-----|
| Dashboard | https://mantaga.vercel.app |
| GitHub | https://github.com/Atlas711-ap/Mantaga |
| OpenClaw Docs | https://docs.openclaw.ai |

## Data Retention

- Stock snapshots: Last 90 days
- LPOs: Indefinite
- Invoices: Indefinite

---

*Document Generated: February 27, 2026*  
*Mantaga AI Operations - Mission Control Documentation*
