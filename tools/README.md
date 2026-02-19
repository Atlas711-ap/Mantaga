# Mantaga Tools Library

Central repository for all automation tools built by Forge.

## Philosophy

Tools are built **once**, then executed **many times** by junior agents. Each tool is:
- Deterministic (same input → same output)
- Documented with clear usage
- Tested by Atlas before production use

---

## Priority 1 Tools

### 1. csv_processor.py

Standardizes Talabat CSV format for consistent processing.

**Input:** Raw CSV from Talabat
**Output:** Standardized CSV with normalized columns

**Usage:**
```bash
python csv_processor.py input.csv output.csv
```

**Columns standardized:**
- SKU → sku_code
- Warehouse → darkstore_id
- Qty → quantity
- Date → date

---

### 2. sku_validator.py

Validates SKU codes against master list.

**Input:** CSV file + master SKU list
**Output:** Validation report (pass/fail per row)

**Usage:**
```bash
python sku_validator.py daily.csv master_skus.csv
```

**Output format:**
```
VALID: 45
INVALID: 3
Invalid SKUs: SKU-999, SKU-888, SKU-777
```

---

### 3. velocity_calculator.py

Calculates units/day velocity for each SKU.

**Input:** Standardized CSV with historical data
**Output:** JSON with velocity per SKU

**Usage:**
```bash
python velocity_calculator.py standardized.csv --days 7
```

**Output:**
```json
{
  "SKU-001": { "velocity": 45.2, "trend": "up" },
  "SKU-002": { "velocity": 32.1, "trend": "flat" },
  "SKU-003": { "velocity": 27.0, "trend": "down" }
}
```

---

### 4. oos_forecaster.py

Predicts out-of-stock dates based on velocity and current stock.

**Input:** Velocity data + current inventory
**Output:** OOS risk report

**Usage:**
```bash
python oos_forecaster.py velocities.csv inventory.csv
```

**Output:**
```json
{
  "at_risk": [
    { "sku": "SKU-003", "oos_date": "2026-02-23", "days_remaining": 4 }
  ],
  "warning": [
    { "sku": "SKU-007", "oos_date": "2026-02-28", "days_remaining": 9 }
  ]
}
```

---

## Priority 2 Tools

### 5. compliance_checker.py

Checks SKU data against Talabat platform rules.

**Usage:**
```bash
python compliance_checker.py sku_data.csv
```

---

### 6. darkstore_analyzer.py

Analyzes performance by darkstore location.

**Usage:**
```bash
python darkstore_analyzer.py standardized.csv
```

---

### 7. report_generator.py

Creates client-ready reports.

**Usage:**
```bash
python report_generator.py velocity.json oos.json client_name
```

---

### 8. anomaly_detector.py

Flags unusual patterns in data.

**Usage:**
```bash
python anomaly_detector.py historical.csv current.csv
```

---

## Tool Execution Workflow

### Junior Agent (Nexus/Atlas):
1. Receive task from Athena
2. Execute relevant tool
3. Report results to Athena

**Example:**
```
Athena: "@Nexus, run velocity analysis on today's CSV"

Nexus: $ python velocity_calculator.py talabat_2026-02-19.csv --days 7
Output: velocity_report.json
Nexus: "@Athena, velocity analysis complete. 6 SKUs up, 3 flat. SKU-003 at risk."
```

### No "thinking" required. Just execute and report.

---

## Adding New Tools

1. Forge builds tool → Tests locally
2. Forge requests Atlas QA
3. Atlas tests with real data → Approves or rejects
4. Athena approves for production
5. Tool added to this README
6. Junior agents can now use it

---

*Last Updated: 2026-02-19*
