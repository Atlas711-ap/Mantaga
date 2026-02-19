# MODEL ASSIGNMENTS - Cost Optimization

## Available Models

| Model | Cost | Speed | Use Case |
|-------|------|-------|----------|
| MiniMax M2.5 Highspeed | Expensive (~300 prompts/5hr) | Fast | Strategic reasoning, complex synthesis |
| Ollama qwen2.5-coder:32b | Free (local, unlimited) | Fast | Data processing, calculations, code execution |

---

## Assignment by Agent

### ATHENA → MiniMax M2.5 Highspeed

**Why:** Strategic decisions, synthesis, human communication requires strong reasoning

**What Athena does:**
- Prioritizes tasks (strategic judgment)
- Resolves conflicts (nuanced reasoning)
- Communicates with Anush (human communication)
- Makes calls when data conflicts (complex reasoning)
- Decides what to build (strategic planning)

**Model:** `minimax/MiniMax-M2.5`
**Prompt usage:** ~50-80 prompts/day

---

### NEXUS → Ollama Local 32B

**Why:** Data processing and calculations are deterministic, not creative

**What Nexus does:**
- Processes CSV files (mechanical)
- Calculates velocities (math)
- Runs statistical analysis (deterministic)
- Generates charts (code execution)
- Flags anomalies (pattern matching)

**Model:** `ollama/qwen2.5-coder:32b`
**Prompt usage:** Unlimited (local, free)

**CRITICAL:** Nexus should NEVER make strategic decisions. If numbers show a problem, report to Athena. Athena decides what it means. Nexus executes tools that Forge builds. Nexus doesn't "think" about data - Nexus **PROCESSES** data using predefined scripts.

---

### ATLAS → Ollama Local 32B

**Why:** Validation is rule-based, not creative

**What Atlas does:**
- Validates CSV format (rule checking)
- Cross-checks SKU codes (lookup)
- Verifies compliance (checklist)
- QA tests tools (test execution)
- Runs data quality checks (deterministic)

**Model:** `ollama/qwen2.5-coder:32b`
**Prompt usage:** Unlimited (local, free)

**CRITICAL:** Atlas follows checklists and rules. Atlas doesn't interpret what failures mean - Atlas **REPORTS** failures to Athena. Athena decides how to respond. Atlas executes validation scripts that Forge builds. Atlas doesn't "think" about quality - Atlas **CHECKS** quality using predefined rules.

---

### FORGE → Ollama Local 32B

**Why:** Code generation is what the 32B coder model is BUILT for

**What Forge does:**
- Writes Python scripts (code generation)
- Builds automation tools (coding)
- Creates data processing pipelines (coding)
- Writes tests (coding)
- Optimizes performance (coding)

**Model:** `ollama/qwen2.5-coder:32b`
**Prompt usage:** Unlimited (local, free)

**CRITICAL:** Forge is a coder, not a strategist. Athena tells Forge WHAT to build and WHY (strategic context). Forge builds it. Forge doesn't decide what tools are needed - Athena decides. Forge just builds what Athena requests.

---

## The Economic Reality

**Current plan:** 300 prompts per 5 hours with MiniMax

### If all agents use MiniMax:
- 4 agents × 50 prompts/day = 200 prompts/day
- Leaves only 100 prompt buffer
- Can't handle spikes
- Risky

### If juniors use Local 32B:
- 1 agent (Athena) × 50-80 prompts/day = 80 prompts/day
- Leaves 220 prompt buffer
- Can handle spikes easily
- Scalable to more clients/brands

**This is how Mantaga scales without burning budget.**

---

*Last Updated: 2026-02-19*
