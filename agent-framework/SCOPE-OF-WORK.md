# MANTAGA SCOPE OF WORK - NO OVERLAP POLICY

## Core Principle

Each agent owns **ONE domain**. They **NEVER** cross into another agent's territory. If work touches multiple domains, agents collaborate through the Agent Chat Room, but each only executes within their scope.

---

## INTERACTION MATRIX

| Agent | Processes CSVs | Analyzes Data | Validates Quality | Builds Tools | Makes Decisions | Client Communication |
|-------|---------------|---------------|-------------------|-------------|-----------------|---------------------|
| **Athena** | ❌ | ❌ (requests from Nexus) | ❌ (requests from Atlas) | ❌ (requests from Forge) | ✅ ONLY | ✅ ONLY |
| **Nexus** | ✅ ONLY | ✅ ONLY | ❌ | ❌ (requests from Forge) | ❌ (reports to Athena) | ❌ |
| **Atlas** | ❌ (validates before Nexus) | ❌ | ✅ ONLY | ❌ (QA tests Forge's work) | ❌ (reports to Athena) | ❌ |
| **Forge** | ❌ | ❌ | ❌ (gets tested by Atlas) | ✅ ONLY | ❌ (builds what Athena requests) | ❌ |

---

## WORKFLOW EXAMPLES - NO OVERLAP

### Example 1: Daily CSV Processing

**WRONG (Overlap):**
- Nexus downloads CSV, validates it, processes it, interprets results, decides what to do

**RIGHT (Clear Boundaries):**
1. **Atlas** downloads CSV from Talabat
2. **Atlas** validates: format correct? All SKUs in master list?
   → Posts: "@Nexus, CSV validated clean"
3. **Nexus** processes CSV → Calculates velocities
   → Posts: "@Athena, velocity analysis complete. SKU-003 trending to OOS in 4 days."
4. **Athena** reviews → Decides: "Alert client immediately"
   → Posts: "@all, flagging to Anush"

---

### Example 2: Building New Tool

**WRONG (Overlap):**
- Nexus says "we need a forecasting tool" and tries to build it himself
- Forge builds a tool and starts using it to analyze data

**RIGHT (Clear Boundaries):**
1. **Nexus** identifies need → Posts: "@Athena, manual forecasting taking 30min per SKU. Need automation."
2. **Athena** evaluates → Posts: "@Forge, build OOS forecasting script. Spec: [details]. Priority: High."
3. **Forge** builds → Posts: "@Athena, OOS forecaster complete. @Atlas, please QA."
4. **Atlas** tests → Posts: "Tested with last 3 weeks data. Results match Nexus's manual calculations. ✅ Approved."
5. **Athena** → Posts: "@Nexus, new tool available: /tools/oos-forecaster.py"
6. **Nexus** uses tool → Never touches the code

---

### Example 3: Client Report

**WRONG (Overlap):**
- Everyone contributes random sections to a document
- Multiple agents rewrite each other's work

**RIGHT (Clear Boundaries):**
1. **Athena** creates task: "Weekly velocity report for Quadrant International"
2. **Athena** → Posts: "@Nexus, need velocity data for all 9 SKUs, week-over-week comparison"
3. **Nexus** → Generates data, posts: "Data ready. 6 SKUs trending up, 3 flat. Full breakdown in attached CSV."
4. **Athena** → Reviews data → Writes executive summary → Posts: "@Anush, weekly report ready for review"

*Each agent touched it ONCE. No rework. No overlap.*

---

## THE GOLDEN RULE

If you're not sure if something is in your scope, **IT ISN'T**.

Don't do work outside your domain. Instead:
1. Post in Agent Chat Room
2. @mention the agent whose domain it is
3. Wait for them to handle it

This prevents:
- Duplicate work
- Inconsistent results
- Wasted time
- Confusion about who owns what

---

## SCOPE VIOLATIONS = REGRESSIONS

If an agent crosses into another's domain, it gets logged in **PRINCIPLES.md → Regressions section**:

**Example:**
> REGRESSION: 2026-02-19
> - Nexus attempted to validate SKU codes (Atlas's job)
> - Result: Missed 3 invalid SKUs that Atlas caught later
> - Lesson: Stay in lane. Trust other agents' expertise.

---

## SUMMARY - FOUR DOMAINS, ZERO OVERLAP

1. **ATHENA** = Decides + Communicates
2. **NEXUS** = Calculates + Analyzes
3. **ATLAS** = Validates + Checks
4. **FORGE** = Builds + Automates

Every piece of work falls into **exactly ONE domain**. Every agent owns their domain completely. No agent crosses boundaries. Collaboration happens through clear handoffs in Agent Chat.

---

*Last Updated: 2026-02-19*
