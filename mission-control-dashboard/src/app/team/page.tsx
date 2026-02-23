"use client";

export const dynamic = 'force-dynamic';

import { useState } from "react";

interface Agent {
  id: string;
  name: string;
  role: string;
  department: string;
  reports_to: string;
  model: string;
  status: "ACTIVE" | "IDLE" | "OFFLINE";
  responsibilities: string[];
  last_action: string;
}

// AI Agent Team Structure
const agents: Agent[] = [
  // Level 1: CEO
  {
    id: "athena",
    name: "Athena",
    role: "CEO Agent",
    department: "Executive",
    reports_to: "Anush (CEO)",
    model: "MiniMax M2.5",
    status: "ACTIVE",
    responsibilities: [
      "Coordinates all AI agents",
      "Makes strategic decisions",
      "Daily briefings to Anush",
      "Escalation point"
    ],
    last_action: "Morning brief sent — Today 1:00 AM"
  },
  // Level 2: Managers
  {
    id: "nexus",
    name: "Nexus",
    role: "Trade Marketing Manager",
    department: "Commercial",
    reports_to: "Athena",
    model: "Qwen 32B",
    status: "ACTIVE",
    responsibilities: [
      "Maintain targets vs actual sales",
      "On app marketing budgets",
      "Promotions budgets",
      "Never exceed 20% spend of sales"
    ],
    last_action: "Monthly report ready — Pending review"
  },
  {
    id: "atlas",
    name: "Atlas",
    role: "Ecommerce KAM",
    department: "Ecommerce",
    reports_to: "Athena",
    model: "Qwen 32B",
    status: "ACTIVE",
    responsibilities: [
      "Manage customer insights",
      "Ads performance analysis",
      "Stock movement tracking",
      "Customer sales by brand",
      "Coordinates sub-agents"
    ],
    last_action: "Stock alerts processed — Today"
  },
  {
    id: "forge",
    name: "Forge",
    role: "Supply Chain Manager",
    department: "Operations",
    reports_to: "Athena",
    model: "Qwen 32B",
    status: "ACTIVE",
    responsibilities: [
      "SKU volume forecasting by brand",
      "Stock movement analysis",
      "Forecast → Nexus for sales targets",
      "Inventory planning"
    ],
    last_action: "Forecast updated — This week"
  },
  {
    id: "neo",
    name: "Neo",
    role: "IT Manager",
    department: "Technology",
    reports_to: "Athena",
    model: "Qwen 32B",
    status: "IDLE",
    responsibilities: [
      "Build tools and skills",
      "Create automations for team",
      "Improve quality of work",
      "Simplify tasks"
    ],
    last_action: "Awaiting request"
  },
  {
    id: "zeus",
    name: "Zeus",
    role: "Marketing Manager",
    department: "Marketing",
    reports_to: "Athena",
    model: "Qwen 32B",
    status: "IDLE",
    responsibilities: [
      "Digital marketing strategies",
      "Brand marketing",
      "Client acquisition",
      "LinkedIn, X, Instagram, TikTok"
    ],
    last_action: "Awaiting request"
  },
  // Level 3: Sub-agents (under Atlas)
  {
    id: "faith",
    name: "Faith",
    role: "Ecommerce Coordinator",
    department: "Ecommerce",
    reports_to: "Atlas",
    model: "Qwen 32B",
    status: "IDLE",
    responsibilities: [
      "Maintain Master SKU List",
      "Read daily stock reports",
      "Prepare Customer Performance data",
      "Report to Atlas"
    ],
    last_action: "Awaiting upload"
  },
  {
    id: "alexis",
    name: "Alexis",
    role: "Performance Marketing",
    department: "Ecommerce",
    reports_to: "Atlas",
    model: "Qwen 32B",
    status: "IDLE",
    responsibilities: [
      "Manage PPC campaigns on Talabat",
      "Analyze campaign performance",
      "Provide insights to Atlas",
      "ROAS optimization"
    ],
    last_action: "Awaiting data"
  }
];

const agentColors: Record<string, string> = {
  athena: "#F59E0B",    // Gold
  nexus: "#06B6D4",     // Cyan
  atlas: "#10B981",     // Emerald
  forge: "#8B5CF6",     // Purple
  neo: "#EF4444",       // Red
  zeus: "#F97316",      // Orange
  faith: "#10B981",     // Emerald (sub-agent of Atlas)
  alexis: "#10B981"     // Emerald (sub-agent of Atlas)
};

export default function TeamPage() {
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">AI Agent Team</h1>
        <p className="text-gray-500 dark:text-gray-400">Meet the autonomous team running Mantaga</p>
      </div>

      {/* Organization Structure */}
      <div className="mb-8 p-4 bg-gradient-to-r from-slate-800 to-slate-900 rounded-xl">
        <h2 className="text-sm font-medium text-gray-400 mb-4">Organization Structure</h2>
        <div className="flex flex-col items-center">
          {/* Anush */}
          <div className="px-4 py-2 bg-amber-500/20 border border-amber-500 rounded-lg text-amber-400 text-sm font-medium mb-4">
            👤 Anush (CEO)
          </div>
          <div className="w-px h-4 bg-gray-600"></div>
          
          {/* Athena */}
          <div className="px-4 py-2 bg-amber-500/20 border border-amber-500 rounded-lg text-amber-400 text-sm font-medium mb-4 flex items-center gap-2">
            🤖 Athena <span className="text-xs text-gray-500">(CEO Agent)</span>
          </div>
          <div className="w-px h-4 bg-gray-600"></div>
          
          {/* Managers Row */}
          <div className="flex gap-3 mb-4 flex-wrap justify-center">
            <div className="px-3 py-2 bg-cyan-500/20 border border-cyan-500 rounded-lg text-cyan-400 text-xs text-center min-w-[80px]">
              🔵 Nexus<br/><span className="text-gray-500">Trade Mktg</span>
            </div>
            <div className="px-3 py-2 bg-emerald-500/20 border border-emerald-500 rounded-lg text-emerald-400 text-xs text-center min-w-[80px]">
              💚 Atlas<br/><span className="text-gray-500">Ecommerce</span>
            </div>
            <div className="px-3 py-2 bg-purple-500/20 border border-purple-500 rounded-lg text-purple-400 text-xs text-center min-w-[80px]">
              💜 Forge<br/><span className="text-gray-500">Supply Chain</span>
            </div>
            <div className="px-3 py-2 bg-red-500/20 border border-red-500 rounded-lg text-red-400 text-xs text-center min-w-[80px]">
              🔴 Neo<br/><span className="text-gray-500">IT</span>
            </div>
            <div className="px-3 py-2 bg-orange-500/20 border border-orange-500 rounded-lg text-orange-400 text-xs text-center min-w-[80px]">
              🟠 Zeus<br/><span className="text-gray-500">Marketing</span>
            </div>
          </div>
          
          {/* Atlas Sub-agents */}
          <div className="w-px h-4 bg-gray-600"></div>
          <div className="flex gap-3">
            <div className="px-3 py-2 bg-emerald-500/10 border border-emerald-500/50 rounded-lg text-emerald-400/60 text-xs">
              📦 Faith<br/><span className="text-gray-500">Ecommerce Coord</span>
            </div>
            <div className="px-3 py-2 bg-emerald-500/10 border border-emerald-500/50 rounded-lg text-emerald-400/60 text-xs">
              📊 Alexis<br/><span className="text-gray-500">Perf Marketing</span>
            </div>
          </div>
        </div>
      </div>

      {/* Agent Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {agents.map((agent) => (
          <div
            key={agent.id}
            onClick={() => setSelectedAgent(agent)}
            className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 cursor-pointer hover:border-blue-500 transition-colors"
          >
            <div className="flex items-start justify-between mb-3">
              <div 
                className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold"
                style={{ backgroundColor: agentColors[agent.id] }}
              >
                {agent.name.slice(0, 2).toUpperCase()}
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                agent.status === 'ACTIVE' ? 'bg-green-100 text-green-700' :
                agent.status === 'IDLE' ? 'bg-yellow-100 text-yellow-700' :
                'bg-gray-100 text-gray-700'
              }`}>
                {agent.status}
              </span>
            </div>
            
            <h3 className="font-semibold text-gray-900 dark:text-white">{agent.name}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">{agent.role}</p>
            
            <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
              <p className="text-xs text-gray-400">Reports to: {agent.reports_to}</p>
              <p className="text-xs text-gray-400 mt-1">Model: {agent.model}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Agent Detail Modal */}
      {selectedAgent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedAgent(null)}>
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-lg w-full p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div 
                  className="w-14 h-14 rounded-xl flex items-center justify-center text-white font-bold text-lg"
                  style={{ backgroundColor: agentColors[selectedAgent.id] }}
                >
                  {selectedAgent.name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">{selectedAgent.name}</h2>
                  <p className="text-gray-500">{selectedAgent.role}</p>
                </div>
              </div>
              <button onClick={() => setSelectedAgent(null)} className="text-gray-400 hover:text-gray-600 text-2xl">×</button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500">Department</p>
                  <p className="font-medium">{selectedAgent.department}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Reports To</p>
                  <p className="font-medium">{selectedAgent.reports_to}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Model</p>
                  <p className="font-medium">{selectedAgent.model}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Status</p>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    selectedAgent.status === 'ACTIVE' ? 'bg-green-100 text-green-700' :
                    'bg-yellow-100 text-yellow-700'
                  }`}>
                    {selectedAgent.status}
                  </span>
                </div>
              </div>

              <div>
                <p className="text-xs text-gray-500 mb-2">Responsibilities</p>
                <ul className="space-y-1">
                  {selectedAgent.responsibilities.map((resp, i) => (
                    <li key={i} className="text-sm text-gray-700 dark:text-gray-300 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                      {resp}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <p className="text-xs text-gray-500">Last Activity</p>
                <p className="text-sm text-gray-700 dark:text-gray-300">{selectedAgent.last_action}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
