"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { 
  Crown, 
  Zap, 
  Shield, 
  Hammer, 
  MessageSquare, 
  Clock, 
  Activity,
  CheckCircle,
  AlertTriangle
} from "lucide-react";
import { clsx } from "clsx";

const agentColors = {
  Athena: "from-purple-500/20 to-purple-600/10 border-purple-500/30",
  Nexus: "from-blue-500/20 to-blue-600/10 border-blue-500/30",
  Atlas: "from-green-500/20 to-green-600/10 border-green-500/30",
  Forge: "from-orange-500/20 to-orange-600/10 border-orange-500/30",
};

const agentIcons = {
  Athena: Crown,
  Nexus: Zap,
  Atlas: Shield,
  Forge: Hammer,
};

const agentStatusColors = {
  idle: "bg-slate-500",
  working: "bg-green-500",
  analyzing: "bg-blue-500",
  processing: "bg-yellow-500",
  building: "bg-orange-500",
  checking: "bg-cyan-500",
};

export default function TeamPage() {
  const agents = useQuery(api.seed.getAgents);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Mantaga AI Team</h1>
        <p className="text-slate-400 mt-1">Autonomous operations team structure</p>
      </div>

      {/* Team Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {agents?.map((agent) => {
          const Icon = agentIcons[agent.name as keyof typeof agentIcons];
          const colorClass = agentColors[agent.name as keyof typeof agentColors];
          const statusColor = agentStatusColors[agent.status as keyof typeof agentStatusColors] || "bg-slate-500";
          
          return (
            <div
              key={agent._id}
              className={clsx(
                "bg-gradient-to-br rounded-xl p-6 border",
                colorClass
              )}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center text-2xl">
                    {agent.avatar}
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">{agent.name}</h3>
                    <p className="text-xs text-slate-400">{agent.role}</p>
                  </div>
                </div>
                <Icon className="w-5 h-5 text-slate-400" />
              </div>

              {/* Status */}
              <div className="flex items-center gap-2 mb-3">
                <div className={clsx("w-2 h-2 rounded-full", statusColor)} />
                <span className="text-xs text-slate-300 capitalize">{agent.status}</span>
              </div>

              {/* Current Task */}
              <div className="bg-slate-800/50 rounded-lg p-3">
                <p className="text-xs text-slate-400 mb-1">Current Task</p>
                <p className="text-sm text-slate-200 line-clamp-2">{agent.current_task}</p>
              </div>

              {/* Description */}
              <p className="text-xs text-slate-500 mt-3">{agent.description}</p>
            </div>
          );
        })}
      </div>

      {/* Detailed Agent Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Athena */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center text-4xl">
              👑
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Athena</h2>
              <p className="text-purple-400">CEO / Strategic Manager</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-slate-400 mb-2">Responsibilities</h3>
              <ul className="space-y-2">
                <li className="flex items-center gap-2 text-slate-300">
                  <Crown className="w-4 h-4 text-purple-400" />
                  Synthesizes insights from data
                </li>
                <li className="flex items-center gap-2 text-slate-300">
                  <Crown className="w-4 h-4 text-purple-400" />
                  Makes strategic decisions
                </li>
                <li className="flex items-center gap-2 text-slate-300">
                  <Crown className="w-4 h-4 text-purple-400" />
                  Communicates with Anush (human)
                </li>
                <li className="flex items-center gap-2 text-slate-300">
                  <Crown className="w-4 h-4 text-purple-400" />
                  Daily briefings & priority setting
                </li>
              </ul>
            </div>
            
            <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="w-4 h-4 text-purple-400" />
                <span className="text-sm font-medium text-purple-400">Current Status</span>
              </div>
              <p className="text-slate-300">Working - Synthesizing daily insights from Talabat data</p>
            </div>
          </div>
        </div>

        {/* Nexus */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center text-4xl">
              ⚡
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Nexus</h2>
              <p className="text-blue-400">Operations Manager</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-slate-400 mb-2">Responsibilities</h3>
              <ul className="space-y-2">
                <li className="flex items-center gap-2 text-slate-300">
                  <Zap className="w-4 h-4 text-blue-400" />
                  CSV processing (Talabat SOH)
                </li>
                <li className="flex items-center gap-2 text-slate-300">
                  <Zap className="w-4 h-4 text-blue-400" />
                  Inventory tracking & monitoring
                </li>
                <li className="flex items-center gap-2 text-slate-300">
                  <Zap className="w-4 h-4 text-blue-400" />
                  Velocity analysis & forecasting
                </li>
                <li className="flex items-center gap-2 text-slate-300">
                  <Zap className="w-4 h-4 text-blue-400" />
                  OOS risk flagging
                </li>
              </ul>
            </div>
            
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="w-4 h-4 text-blue-400" />
                <span className="text-sm font-medium text-blue-400">Current Status</span>
              </div>
              <p className="text-slate-300">Processing - Processing Talabat SOH CSV for Mudhish brand</p>
            </div>
          </div>
        </div>

        {/* Atlas */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center text-4xl">
              🛡️
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Atlas</h2>
              <p className="text-green-400">Compliance & Quality</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-slate-400 mb-2">Responsibilities</h3>
              <ul className="space-y-2">
                <li className="flex items-center gap-2 text-slate-300">
                  <Shield className="w-4 h-4 text-green-400" />
                  SKU validation & verification
                </li>
                <li className="flex items-center gap-2 text-slate-300">
                  <Shield className="w-4 h-4 text-green-400" />
                  Content compliance checks
                </li>
                <li className="flex items-center gap-2 text-slate-300">
                  <Shield className="w-4 h-4 text-green-400" />
                  Data quality verification
                </li>
                <li className="flex items-center gap-2 text-slate-300">
                  <Shield className="w-4 h-4 text-green-400" />
                  Inventory accuracy checks
                </li>
              </ul>
            </div>
            
            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="w-4 h-4 text-green-400" />
                <span className="text-sm font-medium text-green-400">Current Status</span>
              </div>
              <p className="text-slate-300">Checking - Validating SKU compliance for 9 Mudhish products</p>
            </div>
          </div>
        </div>

        {/* Forge */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-orange-500/20 rounded-full flex items-center justify-center text-4xl">
              🔨
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Forge</h2>
              <p className="text-orange-400">Infrastructure Developer</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-slate-400 mb-2">Responsibilities</h3>
              <ul className="space-y-2">
                <li className="flex items-center gap-2 text-slate-300">
                  <Hammer className="w-4 h-4 text-orange-400" />
                  Build tools & scripts
                </li>
                <li className="flex items-center gap-2 text-slate-300">
                  <Hammer className="w-4 h-4 text-orange-400" />
                  Automation development
                </li>
                <li className="flex items-center gap-2 text-slate-300">
                  <Hammer className="w-4 h-4 text-orange-400" />
                  Infrastructure maintenance
                </li>
                <li className="flex items-center gap-2 text-slate-300">
                  <Hammer className="w-4 h-4 text-orange-400" />
                  System optimizations
                </li>
              </ul>
            </div>
            
            <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="w-4 h-4 text-orange-400" />
                <span className="text-sm font-medium text-orange-400">Current Status</span>
              </div>
              <p className="text-slate-300">Building - Building velocity calculator script</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Team Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <a 
            href="/chat"
            className="flex items-center gap-3 p-4 bg-slate-800/50 border border-slate-700 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <MessageSquare className="w-5 h-5 text-blue-400" />
            <div>
              <p className="font-medium text-white">Agent Chat Room</p>
              <p className="text-xs text-slate-400">Coordinate with team</p>
            </div>
          </a>
          
          <div className="flex items-center gap-3 p-4 bg-slate-800/50 border border-slate-700 rounded-lg">
            <Clock className="w-5 h-5 text-purple-400" />
            <div>
              <p className="font-medium text-white">Schedule Meeting</p>
              <p className="text-xs text-slate-400">Set up team sync</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-4 bg-slate-800/50 border border-slate-700 rounded-lg">
            <Activity className="w-5 h-5 text-green-400" />
            <div>
              <p className="font-medium text-white">View Analytics</p>
              <p className="text-xs text-slate-400">Team performance</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
