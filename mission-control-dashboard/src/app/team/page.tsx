"use client";

import { useState } from "react";

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
          <div className="flex items-center gap-1">
            <div className={`w-2 h-2 rounded-full ${agent.status === "ACTIVE" ? "bg-green-500" : agent.status === "IDLE" ? "bg-slate-500" : "bg-red-500"}`} />
            <span className="text-[10px] text-slate-400">{agent.status}</span>
          </div>
        </div>
      </div>

      {isHovered && (
        <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 w-[280px] bg-slate-800 border border-slate-700 rounded-lg p-3 z-50">
          <div className="text-white font-medium text-sm mb-1">{agent.name} — {agent.role}</div>
          <div className="text-slate-400 text-xs mb-2">Model: {agent.primary_model}</div>
          <div className="text-slate-300 text-xs border-t border-slate-700 pt-2">
            <span className="text-slate-500">Last action:</span> {agent.last_action}
          </div>
        </div>
      )}
    </div>
  );
}

export default function TeamPage() {
  const [hoveredAgent, setHoveredAgent] = useState<Agent | null>(null);
  
  const athena = mockAgents.find(a => a.id === "athena")!;
  const reports = mockAgents.filter(a => a.id !== "athena");

  return (
    <div className="space-y-6 relative h-[600px]">
      <div>
        <span className="bg-amber-900/20 border border-amber-800 text-amber-400 text-xs px-3 py-1 rounded-full">
          PHASE 1 — TALABAT OPERATIONS
        </span>
      </div>

      <div className="relative w-full h-full">
        {/* SVG Lines Layer */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }}>
          {/* Vertical line from Athena down */}
          <line x1="440" y1="140" x2="440" y2="200" stroke="#475569" strokeWidth="1.5" />
          
          {/* Horizontal line */}
          <line x1="220" y1="200" x2="660" y2="200" stroke="#475569" strokeWidth="1.5" />
          
          {/* Arrow to Nexus */}
          <line x1="220" y1="200" x2="220" y2="210" stroke="#475569" strokeWidth="1.5" />
          <polygon points="220,215 215,207 225,207" fill="#475569" />
          
          {/* Arrow to Atlas */}
          <line x1="440" y1="200" x2="440" y2="210" stroke="#475569" strokeWidth="1.5" />
          <polygon points="440,215 435,207 445,207" fill="#475569" />
          
          {/* Arrow to Forge */}
          <line x1="660" y1="200" x2="660" y2="210" stroke="#475569" strokeWidth="1.5" />
          <polygon points="660,215 655,207 665,207" fill="#475569" />
        </svg>

        {/* Athena at top center */}
        <div className="absolute" style={{ top: 20, left: 330 }}>
          <div 
            className="w-[220px] h-[120px] bg-slate-900 rounded-xl flex flex-col items-center justify-center p-3 cursor-pointer transition-all"
            style={{ border: `1.5px solid ${athena.color}`, boxShadow: `0 0 12px ${athena.color}33` }}
            onMouseEnter={() => setHoveredAgent(athena)}
            onMouseLeave={() => setHoveredAgent(null)}
          >
            <div 
              className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm mb-2"
              style={{ backgroundColor: `${athena.color}33`, border: `2px solid ${athena.color}` }}
            >
              {athena.name.slice(0, 2).toUpperCase()}
            </div>
            <div className="text-white font-semibold text-base">{athena.name}</div>
            <div className="text-slate-400 text-sm">{athena.role}</div>
            <div className="flex items-center justify-between w-full mt-auto">
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-800 text-slate-400">
                {athena.primary_model}
              </span>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span className="text-[10px] text-slate-400">{athena.status}</span>
              </div>
            </div>
          </div>

          {hoveredAgent?.id === "athena" && (
            <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 w-[280px] bg-slate-800 border border-slate-700 rounded-lg p-3 z-50">
              <div className="text-white font-medium text-sm mb-1">{athena.name} — {athena.role}</div>
              <div className="text-slate-400 text-xs mb-2">Model: {athena.primary_model}</div>
              <div className="text-slate-300 text-xs border-t border-slate-700 pt-2">
                <span className="text-slate-500">Last action:</span> {athena.last_action}
              </div>
            </div>
          )}
        </div>

        {/* Three reports below */}
        {reports.map((agent, idx) => (
          <div 
            key={agent.id} 
            className="absolute"
            style={{ top: 220, left: idx === 0 ? 110 : idx === 1 ? 330 : 550 }}
            onMouseEnter={() => setHoveredAgent(agent)}
            onMouseLeave={() => setHoveredAgent(null)}
          >
            <div 
              className="w-[220px] h-[120px] bg-slate-900 rounded-xl flex flex-col items-center justify-center p-3 cursor-pointer transition-all"
              style={{ 
                border: `1.5px solid ${agent.color}`,
                boxShadow: `0 0 12px ${agent.color}33`
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
                <div className="flex items-center gap-1">
                  <div className={`w-2 h-2 rounded-full ${agent.status === "ACTIVE" ? "bg-green-500" : agent.status === "IDLE" ? "bg-slate-500" : "bg-red-500"}`} />
                  <span className="text-[10px] text-slate-400">{agent.status}</span>
                </div>
              </div>
            </div>

            {hoveredAgent?.id === agent.id && (
              <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 w-[280px] bg-slate-800 border border-slate-700 rounded-lg p-3 z-50">
                <div className="text-white font-medium text-sm mb-1">{agent.name} — {agent.role}</div>
                <div className="text-slate-400 text-xs mb-2">Model: {agent.primary_model}</div>
                <div className="text-slate-300 text-xs border-t border-slate-700 pt-2">
                  <span className="text-slate-500">Last action:</span> {agent.last_action}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Cron Schedule */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 mt-[280px]">
        <div className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-3">Cron Schedule</div>
        <div className="grid grid-cols-2 md:grid-cols-6 gap-2 text-xs">
          {CRON_SCHEDULE.slice(0, 6).map((cron, i) => (
            <div key={i} className="bg-slate-800 rounded p-2">
              <div className="text-amber-400 font-medium">{cron.time}</div>
              <div className="text-slate-400 truncate">{cron.agent}</div>
              <div className="text-slate-500 truncate">{cron.task}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
