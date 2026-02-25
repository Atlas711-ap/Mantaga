# Mantaga AI Team Structure

## Communication Flow
**User → Athena → Team → (ask Neo for tools) → Athena → User**

## Model Distribution
- **MiniMax-M2.5:** Athena (orchestration), Neo (tool building), Zeus (marketing)
- **qwen2.5-vl:32b:** Atlas (document parsing), Scout (data fetching)
- **qwen2.5-coder:32b:** Nexus, Atlas, Forge, Faith, Alexis

## Agent Roles

| Agent | Role | Model | Scope |
|-------|------|-------|-------|
| **Athena** | CEO Coordinator | MiniMax-M2.5 | Orchestrates team |
| **Neo** | IT & Tools | MiniMax-M2.5 | Builds skills & tools |
| **Atlas** | Document Parser | qwen2.5-vl:32b | LPO & Invoice parsing |
| **Scout** | Data Fetcher | qwen2.5-vl:32b | API data from platforms |
| **Nexus** | Sales Manager | qwen2.5-coder:32b | Sales analysis |
| **Atlas** | Stock & Customers | qwen2.5-coder:32b | SKU & customer data |
| **Forge** | Supply Chain | qwen2.5-coder:32b | Demand forecasting |
| **Zeus** | Marketing | MiniMax-M2.5 | Brand & campaigns |
| **Faith** | SKU Coordinator | qwen2.5-coder:32b | SKU validation |
| **Alexis** | PPC Ads | qwen2.5-coder:32b | Ad optimization |

## Key Rules
1. When any agent needs a skill/tool → Ask Neo to build it
2. When data needs parsing from PDFs/images → Use qwen2.5-vl:32b
3. When data needs text analysis → Use qwen2.5-coder:32b
4. When reasoning/strategy needed → Use MiniMax-M2.5

## Vercel Deployment Rules (IMPORTANT)
- Project name: **mantaga**
- Path: **~/Mantaga/mission-control-dashboard/**
- NEVER create new Vercel projects
- Check .vercel/project.json before deploying
- Command: `cd ~/Mantaga/mission-control-dashboard && git push origin main`

---

*Last Updated: 2026-02-25*
