"use client";

import { useState } from "react";
import { useAgentEventLog, useRecentAgentEvents } from "../../hooks/useConvex";

interface Agent {
  id: string;
  name: string;
  role: string;
  color: string;
  primary_model: string;
  status: "ACTIVE" | "IDLE" | "ERROR";
  last_action: string;
}

const mockAgents: Agent[] = [
  { id: "athena", name: "Athena", role: "CEO", color: "#F59E0B", primary_model: "MiniMax", status: "ACTIVE", last_action: "Morning brief sent to Telegram — 19 Feb 2026, 07:00" },
  { id: "nexus", name: "Nexus", role: "Operations", color: "#06B6D4", primary_model: "Qwen 32B", status: "ACTIVE", last_action: "Stock report processed — 19 Feb 2026, 06:00" },
  { id: "atlas", name: "Atlas", role: "SKU Coordinator", color: "#10B981", primary_model: "Qwen 32B", status: "IDLE", last_action: "Barcode cross-reference complete — 19 Feb 2026, 06:15" },
  { id: "forge", name: "Forge", role: "Developer Agent", color: "#8B5CF6", primary_model: "Qwen 32B", status: "IDLE", last_action: "System health check passed — 19 Feb 2026, 05:45" },
];

export const CRON_SCHEDULE = [
  { time: "7:45 AM", agent: "Forge", task: "System health check" },
  { time: "8:00 AM", agent: "Atlas", task: "Barcode cross-reference (Mon-Fri)" },
  { time: "8:30 AM", agent: "Atlas", task: "Weekly SKU quality (Mon)" },
  { time: "9:00 AM", agent: "Athena", task: "Morning brief" },
  { time: "2:00 PM", agent: "Nexus", task: "Stock analysis (Mon-Fri)" },
  { time: "8:00 PM", agent: "Athena", task: "EOD summary" },
];

function AgentCard({ agent, onHover, position }: { agent: Agent; onHover: (a: Agent | null) => void; position: "top" | "bottom-left" | "bottom-center" | "bottom-right" }) {
  const [isHovered, setIsHovered] = useState(false);
  
  const topOffset = position === "top" ? 0 : position === "bottom-left" ? 200 : position === "bottom-center" ? 200 : 200;
  const leftOffset = position === "top" ? 330 : position === "bottom-left" ? 110 : position === "bottom-center" ? 330 : 550;
  
  return (
    <div 
      className="absolute"
      style={{ top: topOffset, left: leftOffset }}
      onMouseEnter={() => { setIsHovered(true); onHover(agent); }}
      onMouseLeave={() => { setIsHovered(false); onHover(null); }}
    >
      <div 
        className="w-[220px] h-[120px] bg-slate-900 rounded-xl flex flex-col items-center justify-center p-3 transition-all cursor-pointer"
        style={{ 
          border: `1.5px solid ${agent.color}`,
          boxShadow: isHovered ? `0 0 20px ${agent.color}40` : `0 0 12px ${agent.color}33`
        }}
      >
        <div 
          className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm mb-2"
          style={{ backgroundColor: `${agent.color}33`, border: `2px solid ${agent.color}` }}
        >
          {agent.name.slice(0, 2).toUpperCase()}
        </div>
        <div className="text-white font-semibold text-base">{agent.name}</div>
        <div className="text-slate-400 text-sm">{agent.role}</div>
        <div className="flex items-center justify-between w-full mt-auto">
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-800 text-slate-400">
            {agent.primary_model}
          </span>
          <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
            agent.status === "ACTIVE" ? "bg-green-500/20 text-green-400" :
            agent.status === "IDLE" ? "bg-amber-500/20 text-amber-400" :
            "bg-red-500/20 text-red-400"
          }`}>
            {agent.status}
          </span>
        </div>
      </div>
    </div>
  );
}

export default function TeamPage() {
  const agentEvents = useAgentEventLog();
  const recentEvents = useRecentAgentEvents(10);
  const [hoveredAgent, setHoveredAgent] = useState<Agent | null>(null);

  // Get last action from events if available
  const getLastAction = (agentName: string): string => {
    if (!recentEvents) return "No recent activity";
    const agentEvent = recentEvents.find(e => e.agent.toLowerCase() === agentName.toLowerCase());
    if (!agentEvent) return "No recent activity";
    const date = new Date(agentEvent.timestamp);
    return `${agentEvent.description} — ${date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}, ${date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="text-xs font-medium text-slate-400 uppercase tracking-wider">Team Overview</div>
      </div>

      {/* Agent Cards Grid */}
      <div className="relative h-[400px] bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        {/* Central logo/brand area */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div className="w-32 h-32 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center">
            <span className="text-4xl">🎯</span>
          </div>
          <div className="text-center mt-2 text-slate-500 text-xs">Mantaga</div>
        </div>

        {/* Top Agent */}
        <AgentCard 
          agent={mockAgents[0]} 
          onHover={setHoveredAgent} 
          position="top" 
        />

        {/* Bottom Left */}
        <AgentCard 
          agent={mockAgents[1]} 
          onHover={setHoveredAgent} 
          position="bottom-left" 
        />

        {/* Bottom Center */}
        <AgentCard 
          agent={mockAgents[2]} 
          onHover={setHoveredAgent} 
          position="bottom-center" 
        />

        {/* Bottom Right */}
        <AgentCard 
          agent={mockAgents[3]} 
          onHover={setHoveredAgent} 
          position="bottom-right" 
        />
      </div>

      {/* Hover Detail Panel */}
      {hoveredAgent && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center gap-4 mb-4">
            <div 
              className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-semibold"
              style={{ backgroundColor: `${hoveredAgent.color}33`, border: `2px solid ${hoveredAgent.color}`, color: hoveredAgent.color }}
            >
              {hoveredAgent.name.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="text-white font-semibold text-lg">{hoveredAgent.name}</div>
              <div className="text-slate-400 text-sm">{hoveredAgent.role}</div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <div className="text-xs text-slate-500 uppercase tracking-wider">Status</div>
              <div className={`text-sm ${
                hoveredAgent.status === "ACTIVE" ? "text-green-400" :
                hoveredAgent.status === "IDLE" ? "text-amber-400" : "text-red-400"
              }`}>
                {hoveredAgent.status}
              </div>
            </div>
            <div>
              <div className="text-xs text-slate-500 uppercase tracking-wider">Model</div>
              <div className="text-sm text-white">{hoveredAgent.primary_model}</div>
            </div>
            <div>
              <div className="text-xs text-slate-500 uppercase tracking-wider">Last Action</div>
              <div className="text-sm text-white truncate">{getLastAction(hoveredAgent.name)}</div>
            </div>
          </div>
        </div>
      )}

      {/* Cron Schedule */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
        <div className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-4">Scheduled Tasks</div>
        <div className="space-y-2">
          {CRON_SCHEDULE.map((task, i) => {
            const agent = mockAgents.find(a => a.name === task.agent);
            return (
              <div key={i} className="flex items-center justify-between p-3 bg-slate-800 rounded-lg">
                <div className="flex items-center gap-3">
                  <span className="text-xs text-slate-500 font-mono w-20">{task.time}</span>
                  <span 
                    className="text-sm font-medium"
                    style={{ color: agent?.color }}
                  >
                    {task.agent}
                  </span>
                </div>
                <span className="text-sm text-slate-300">{task.task}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Events from Convex */}
      {recentEvents && recentEvents.length > 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-4">Recent Agent Events (Live)</div>
          <div className="space-y-2">
            {recentEvents.slice(0, 5).map((event) => {
              const agent = mockAgents.find(a => a.name.toLowerCase() === event.agent.toLowerCase());
              return (
                <div key={event._id} className="flex items-center gap-3 p-2 bg-slate-800 rounded-lg">
                  <div 
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: agent?.color || "#666" }}
                  />
                  <span className="text-xs text-slate-400 w-20">{event.agent}</span>
                  <span className="text-xs text-slate-500 w-24">{event.event_type}</span>
                  <span className="text-sm text-slate-300 flex-1 truncate">{event.description}</span>
                  <span className="text-xs text-slate-500">
                    {new Date(event.timestamp).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
