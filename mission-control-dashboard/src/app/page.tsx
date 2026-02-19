export default function DashboardPage() {
  const alerts = [
    { type: "OUT OF STOCK", message: "SKU-003 at Jumeirah Village Circle darkstore", time: "14:32", color: "red" },
    { type: "LOW STOCK", message: "SKU-007 below reorder threshold at 5 darkstores", time: "14:15", color: "amber" },
    { type: "REPLENISHMENT", message: "Auto-replenishment triggered for SKU-001 at 3PL", time: "13:45", color: "emerald" },
  ];

  const agents = [
    { name: "Athena", status: "IDLE", lastAction: "Weekly briefing sent", color: "amber" },
    { name: "Nexus", status: "IDLE", lastAction: "Daily report processed", color: "cyan" },
    { name: "Atlas", status: "IDLE", lastAction: "SKU validation complete", color: "emerald" },
    { name: "Forge", status: "IDLE", lastAction: "System monitoring", color: "violet" },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-5 gap-6">
        {/* Left Column - Alert Feed */}
        <div className="col-span-3 space-y-4">
          <div className="text-xs font-medium text-slate-400 uppercase tracking-wider">Live Alerts</div>
          
          <div className="space-y-3">
            {alerts.length > 0 ? alerts.map((alert, i) => (
              <div
                key={i}
                className={`bg-slate-900 border border-slate-800 rounded-lg p-4 border-l-4 ${
                  alert.color === "red" ? "border-l-red-500" :
                  alert.color === "amber" ? "border-l-amber-500" :
                  alert.color === "emerald" ? "border-l-emerald-500" :
                  "border-l-orange-500"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className={`text-xs font-medium ${
                      alert.color === "red" ? "text-red-400" :
                      alert.color === "amber" ? "text-amber-400" :
                      alert.color === "emerald" ? "text-emerald-400" :
                      "text-orange-400"
                    }`}>
                      {alert.type}
                    </span>
                    <p className="text-sm text-slate-300 mt-1">{alert.message}</p>
                  </div>
                  <span className="text-xs text-slate-500">{alert.time}</span>
                </div>
              </div>
            )) : (
              <div className="bg-slate-900 border border-slate-800 rounded-lg p-8 text-center">
                <p className="text-sm text-slate-500">No alerts — system is healthy</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Agent Status */}
        <div className="col-span-2 space-y-4">
          <div className="text-xs font-medium text-slate-400 uppercase tracking-wider">Agent Status</div>
          
          <div className="space-y-3">
            {agents.map((agent) => (
              <div
                key={agent.name}
                className={`bg-slate-900 border border-slate-800 rounded-lg p-4 border-l-4 ${
                  agent.color === "amber" ? "border-l-amber-500" :
                  agent.color === "cyan" ? "border-l-cyan-500" :
                  agent.color === "emerald" ? "border-l-emerald-500" :
                  "border-l-violet-500"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium text-white ${
                      agent.color === "amber" ? "bg-amber-500/20" :
                      agent.color === "cyan" ? "bg-cyan-500/20" :
                      agent.color === "emerald" ? "bg-emerald-500/20" :
                      "bg-violet-500/20"
                    }`}>
                      {agent.name.slice(0, 2).toUpperCase()}
                    </div>
                    <span className="text-sm font-medium text-white">{agent.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-slate-500"></div>
                    <span className="text-xs text-slate-400">{agent.status}</span>
                  </div>
                </div>
                <p className="text-xs text-slate-500 mt-2">Last action: {agent.lastAction}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
