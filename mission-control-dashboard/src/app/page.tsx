"use client";

export const dynamic = 'force-dynamic';

import { useMemo } from "react";
import { useAgentEventLog, useRecentAgentEvents, useLatestDailyStockSnapshot, useMasterSku } from "../hooks/useConvex";

const AGENT_CONFIG = [
  { name: "Athena", color: "#F59E0B", role: "CEO" },
  { name: "Nexus", color: "#06B6D4", role: "Operations" },
  { name: "Atlas", color: "#10B981", role: "SKU Coordinator" },
  { name: "Forge", color: "#8B5CF6", role: "Developer" },
];

export default function DashboardPage() {
  const events = useAgentEventLog();
  const recentEvents = useRecentAgentEvents(20);
  const stockData = useLatestDailyStockSnapshot();
  const skus = useMasterSku();

  // Generate alerts from stock data
  const alerts = useMemo(() => {
    const alertList: Array<{
      type: string;
      message: string;
      time: string;
      color: string;
    }> = [];

    if (stockData && stockData.length > 0) {
      // Find OOS (out of stock) locations
      const oosLocations = stockData.filter(s => s.effective_stock === 0);
      if (oosLocations.length > 0) {
        alertList.push({
          type: "OUT OF STOCK",
          message: `${oosLocations.length} location(s) out of stock across all SKUs`,
          time: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
          color: "red"
        });
      }

      // Find low stock locations (≤3 units)
      const lowStock = stockData.filter(s => s.effective_stock > 0 && s.effective_stock <= 3);
      if (lowStock.length > 0) {
        alertList.push({
          type: "LOW STOCK",
          message: `${lowStock.length} location(s) with low stock (≤3 units)`,
          time: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
          color: "amber"
        });
      }

      // Find replenishments (high stock locations that might indicate recent delivery)
      const highStock = stockData.filter(s => s.effective_stock > 50);
      if (highStock.length > 0) {
        alertList.push({
          type: "REPLENISHMENT",
          message: `${highStock.length} location(s) with high stock levels`,
          time: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
          color: "emerald"
        });
      }
    }

    // If no stock data, show placeholder
    if (alertList.length === 0) {
      alertList.push({
        type: "SYSTEM READY",
        message: "Upload daily stock report to see live alerts",
        time: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
        color: "emerald"
      });
    }

    return alertList;
  }, [stockData]);

  // Get agent status from recent events
  const agentStatuses = useMemo(() => {
    const statuses: Record<string, { status: string; lastAction: string; lastSeen: string }> = {};
    
    // Initialize all agents as IDLE
    AGENT_CONFIG.forEach(agent => {
      statuses[agent.name] = {
        status: "IDLE",
        lastAction: "No recent activity",
        lastSeen: "—"
      };
    });

    // Update from events
    if (recentEvents) {
      recentEvents.forEach(event => {
        const agentName = event.agent;
        if (statuses[agentName]) {
          const eventTime = new Date(event.timestamp);
          statuses[agentName] = {
            status: event.event_type === "ERROR" ? "ERROR" : "ACTIVE",
            lastAction: event.description,
            lastSeen: eventTime.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
          };
        }
      });
    }

    return statuses;
  }, [recentEvents]);

  // Get last action for each agent
  const getAgentLastAction = (agentName: string): string => {
    const status = agentStatuses[agentName];
    if (!status) return "No recent activity";
    return status.lastAction;
  };

  const getAgentStatus = (agentName: string): string => {
    const status = agentStatuses[agentName];
    if (!status) return "IDLE";
    return status.status;
  };

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

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-4 mt-4">
            <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
              <div className="text-xs text-slate-400 uppercase tracking-wider">Total SKUs</div>
              <div className="text-2xl font-mono text-white mt-1">{skus?.length || 0}</div>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
              <div className="text-xs text-slate-400 uppercase tracking-wider">Stock Records</div>
              <div className="text-2xl font-mono text-white mt-1">{stockData?.length || 0}</div>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
              <div className="text-xs text-slate-400 uppercase tracking-wider">Warehouses</div>
              <div className="text-2xl font-mono text-white mt-1">
                {stockData ? new Set(stockData.map(s => s.warehouse_name)).size : 0}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Agent Status */}
        <div className="col-span-2 space-y-4">
          <div className="text-xs font-medium text-slate-400 uppercase tracking-wider">Agent Status</div>
          
          <div className="space-y-3">
            {AGENT_CONFIG.map((agent) => {
              const status = getAgentStatus(agent.name);
              const lastAction = getAgentLastAction(agent.name);
              
              return (
                <div
                  key={agent.name}
                  className={`bg-slate-900 border border-slate-800 rounded-lg p-4 border-l-4 ${
                    agent.color === "#F59E0B" ? "border-l-amber-500" :
                    agent.color === "#06B6D4" ? "border-l-cyan-500" :
                    agent.color === "#10B981" ? "border-l-emerald-500" :
                    "border-l-violet-500"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium text-white ${
                        agent.color === "#F59E0B" ? "bg-amber-500/20" :
                        agent.color === "#06B6D4" ? "bg-cyan-500/20" :
                        agent.color === "#10B981" ? "bg-emerald-500/20" :
                        "bg-violet-500/20"
                      }`}>
                        {agent.name.slice(0, 2).toUpperCase()}
                      </div>
                      <span className="text-sm font-medium text-white">{agent.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${
                        status === "ACTIVE" ? "bg-green-500" : 
                        status === "ERROR" ? "bg-red-500" : "bg-slate-500"
                      }`}></div>
                      <span className="text-xs text-slate-400">{status}</span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 mt-2 truncate" title={lastAction}>
                    Last action: {lastAction}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
