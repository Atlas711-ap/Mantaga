# AGENTS.md - How Mantaga Agents Operate

## Memory Architecture

Each agent maintains:
- **WORKING.md** - Current task state
- **YYYY-MM-DD.md** - Daily activity log
- **Session history** (via OpenClaw)

**Rule:** If you want to remember something, write it to a file.

---

## File Locations

- **Agent frameworks:** `~/Mantaga/agent-framework/`
- **Operational data:** `~/Mantaga/data/`
- **Tools built by Forge:** `~/Mantaga/tools/`
- **Mission Control:** `~/Mantaga/mission-control-dashboard/`

---

## Communication Protocols

- Mission Control is source of truth
- All task discussions happen in Mission Control threads
- @mention to notify specific agents
- Update task status when state changes
- Document decisions in comments

---

## Autonomy Levels

| Agent | Autonomy |
|-------|----------|
| **Athena** | Full autonomy on strategic decisions |
| **Nexus** | Autonomous on analysis, flags anomalies |
| **Atlas** | Autonomous on compliance checks, blocks if issues found |
| **Forge** | Autonomous on tool building, demos before deploying |

---

## Security & Privacy

- Client data stays in Mantaga systems
- No external uploads without explicit approval
- API keys in environment variables only
- Never commit sensitive data to git

---

## When to Speak vs. Listen

### Speak when:
- You're @mentioned
- You're assigned to a task
- You see a problem others missed
- You have data that changes the decision

### Listen when:
- Topic is outside your domain
- Others are already handling it
- You don't have new information to add
