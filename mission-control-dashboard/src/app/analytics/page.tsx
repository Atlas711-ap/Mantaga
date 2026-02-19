"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { 
  TrendingUp, 
  TrendingDown, 
  Package, 
  AlertTriangle, 
  CheckCircle,
  Clock,
  BarChart3,
  PieChart,
  Activity
} from "lucide-react";
import { clsx } from "clsx";

export default function AnalyticsPage() {
  const tasks = useQuery(api.seed.getTasks);
  const pipelineItems = useQuery(api.seed.getPipelineItems);
  const memoryEntries = useQuery(api.seed.getMemoryEntries);

  // Calculate stats
  const completedTasks = tasks?.filter(t => t.status === "done").length || 0;
  const inProgressTasks = tasks?.filter(t => t.status === "in_progress").length || 0;
  const totalTasks = tasks?.length || 0;
  
  const deliveredItems = pipelineItems?.filter(p => p.current_stage === "Delivered").length || 0;
  const blockedItems = pipelineItems?.filter(p => p.blockers && p.blockers.length > 0).length || 0;

  // Task completion rate
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Pipeline progress
  const pipelineStats = {
    dataCollection: pipelineItems?.filter(p => p.current_stage === "Data Collection").length || 0,
    analysis: pipelineItems?.filter(p => p.current_stage === "Analysis").length || 0,
    processing: pipelineItems?.filter(p => p.current_stage === "Processing").length || 0,
    qualityCheck: pipelineItems?.filter(p => p.current_stage === "Quality Check").length || 0,
    delivered: pipelineItems?.filter(p => p.current_stage === "Delivered").length || 0,
  };

  // Task types distribution
  const taskTypes = [
    { name: "CSV Processing", value: tasks?.filter(t => t.type === "CSV Processing").length || 0, color: "bg-emerald-500" },
    { name: "Inventory Analysis", value: tasks?.filter(t => t.type === "Inventory Analysis").length || 0, color: "bg-blue-500" },
    { name: "Compliance Checks", value: tasks?.filter(t => t.type === "Compliance Checks").length || 0, color: "bg-orange-500" },
    { name: "Client Reports", value: tasks?.filter(t => t.type === "Client Reports").length || 0, color: "bg-purple-500" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Analytics</h1>
        <p className="text-slate-400 mt-1">Operational performance metrics</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Task Completion</p>
              <p className="text-3xl font-bold text-white mt-1">{completionRate}%</p>
            </div>
            <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-400" />
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-3">
            {completedTasks} of {totalTasks} tasks completed
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Active Tasks</p>
              <p className="text-3xl font-bold text-white mt-1">{inProgressTasks}</p>
            </div>
            <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-blue-400" />
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-3">
            Tasks in progress
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Pipeline Delivered</p>
              <p className="text-3xl font-bold text-white mt-1">{deliveredItems}</p>
            </div>
            <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
              <Package className="w-6 h-6 text-purple-400" />
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-3">
            Items completed this week
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Blocked Items</p>
              <p className="text-3xl font-bold text-white mt-1">{blockedItems}</p>
            </div>
            <div className="w-12 h-12 bg-red-500/20 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-red-400" />
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-3">
            Items requiring attention
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pipeline Progress */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Pipeline Progress</h2>
          <div className="space-y-4">
            {Object.entries(pipelineStats).map(([stage, count], index) => {
              const percentage = pipelineItems?.length ? Math.round((count / pipelineItems.length) * 100) : 0;
              const colors = [
                "bg-blue-500",
                "bg-purple-500", 
                "bg-yellow-500",
                "bg-cyan-500",
                "bg-green-500"
              ];
              const labels = [
                "Data Collection",
                "Analysis", 
                "Processing",
                "Quality Check",
                "Delivered"
              ];
              
              return (
                <div key={stage}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-slate-400">{labels[index]}</span>
                    <span className="text-sm text-slate-300">{count} ({percentage}%)</span>
                  </div>
                  <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={clsx("h-full transition-all duration-500", colors[index])}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Task Types Distribution */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Task Types Distribution</h2>
          <div className="space-y-4">
            {taskTypes.map((type) => {
              const percentage = totalTasks > 0 ? Math.round((type.value / totalTasks) * 100) : 0;
              
              return (
                <div key={type.name}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-slate-400">{type.name}</span>
                    <span className="text-sm text-slate-300">{type.value} tasks</span>
                  </div>
                  <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={clsx("h-full transition-all duration-500", type.color)}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Agent Performance */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Agent Activity</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-slate-800/50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">👑</span>
              <span className="font-medium text-white">Athena</span>
            </div>
            <p className="text-2xl font-bold text-purple-400">12</p>
            <p className="text-xs text-slate-500">tasks coordinated</p>
          </div>
          
          <div className="bg-slate-800/50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">⚡</span>
              <span className="font-medium text-white">Nexus</span>
            </div>
            <p className="text-2xl font-bold text-blue-400">28</p>
            <p className="text-xs text-slate-500">items processed</p>
          </div>
          
          <div className="bg-slate-800/50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">🛡️</span>
              <span className="font-medium text-white">Atlas</span>
            </div>
            <p className="text-2xl font-bold text-green-400">45</p>
            <p className="text-xs text-slate-500">SKUs validated</p>
          </div>
          
          <div className="bg-slate-800/50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">🔨</span>
              <span className="font-medium text-white">Forge</span>
            </div>
            <p className="text-2xl font-bold text-orange-400">8</p>
            <p className="text-xs text-slate-500">scripts built</p>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Recent Activity</h2>
        <div className="space-y-3">
          <div className="flex items-center gap-4 text-sm">
            <div className="w-2 h-2 bg-green-500 rounded-full" />
            <span className="text-slate-400">Nexus completed velocity analysis</span>
            <span className="text-slate-500 ml-auto">2h ago</span>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <div className="w-2 h-2 bg-green-500 rounded-full" />
            <span className="text-slate-400">Atlas validated 9 SKUs</span>
            <span className="text-slate-500 ml-auto">3h ago</span>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <div className="w-2 h-2 bg-green-500 rounded-full" />
            <span className="text-slate-400">Athena sent weekly report</span>
            <span className="text-slate-500 ml-auto">5h ago</span>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <div className="w-2 h-2 bg-blue-500 rounded-full" />
            <span className="text-slate-400">Nexus started daily CSV processing</span>
            <span className="text-slate-500 ml-auto">6h ago</span>
          </div>
        </div>
      </div>
    </div>
  );
}
