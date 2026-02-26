#!/bin/bash
# Agent task checker - runs via cron

AGENT=$1
TASKS_FILE="$HOME/Mantaga/agent-framework/SHARED/tasks/tasks.json"

if [ ! -f "$TASKS_FILE" ]; then
  echo "No tasks file"
  exit 0
fi

# Check for pending tasks matching agent keywords
case $AGENT in
  nexus)
    KEYWORDS="sales target budget commission revenue"
    ;;
  atlas)
    KEYWORDS="stock inventory SKU product customer warehouse LPO invoice"
    ;;
  forge)
    KEYWORDS="forecast demand replenishment supply inventory"
    ;;
  faith)
    KEYWORDS="validation compliance data quality"
    ;;
  alexis)
    KEYWORDS="ad PPC bid campaign advertising"
    ;;
  scout)
    KEYWORDS="API fetch data platform integration"
    ;;
  neo)
    KEYWORDS="build tool skill script automation code"
    ;;
  zeus)
    KEYWORDS="brand marketing campaign content acquisition"
    ;;
  *)
    echo "Unknown agent: $AGENT"
    exit 1
    ;;
esac

echo "Agent: $AGENT checking for tasks..."
# Logic would go here to check tasks and claim them
