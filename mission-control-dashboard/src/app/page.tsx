"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  ListTodo,
  GitBranch,
  Brain,
  Users,
  AlertTriangle,
  CheckCircle2,
  Clock,
  TrendingUp,
} from "lucide-react";

export default function Dashboard() {
  const tasks = useQuery(api.seed.getTasks);
  const pipelineItems = useQuery(api.seed.getPipelineItems);
  const agents = useQuery(api.seed.getAgents);
  const memoryEntries = useQuery(api.seed.getMemoryEntries);

  const inProgressTasks = tasks?.filter((t) => t.status === "in_progress").length || 0;
  const completedTasks = tasks?.filter((t) => t.status === "done").length || 0;
  const activePipeline = pipelineItems?.length || 0;
  const totalMemory = memoryEntries?.length || 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Mission Control Dashboard</h1>
        <p className="text-slate-400 mt-1">Autonomous AI Operations Overview</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Active Tasks</p>
              <p className="text-3xl font-bold text-white mt-1">{inProgressTasks}</p>
            </div>
            <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <ListTodo className="w-6 h-6 text-blue-400" />
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-3">
            <span className="text-green-400">{completedTasks}</span> completed this week
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Pipeline Items</p>
              <p className="text-3xl font-bold text-white mt-1">{activePipeline}</p>
            </div>
            <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
              <GitBranch className="w-6 h-6 text-purple-400" />
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-3">
            <span className="text-yellow-400">1</span> blocked
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Team Members</p>
              <p className="text-3xl font-bold text-white mt-1">{agents?.length || 0}</p>
            </div>
            <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-green-400" />
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-3">
            <span className="text-green-400">4</span> active agents
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Memory Entries</p>
              <p className="text-3xl font-bold text-white mt-1">{totalMemory}</p>
            </div>
            <div className="w-12 h-12 bg-cyan-500/20 rounded-lg flex items-center justify-center">
              <Brain className="w-6 h-6 text-cyan-400" />
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-3">
            <span className="text-cyan-400">6</span> strategic insights
          </p>
        </div>
      </div>

      {/* Team Status */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4">AI Team Status</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {agents?.map((agent) => (
            <div
              key={agent._id}
              className="bg-slate-800/50 border border-slate-700 rounded-lg p-4"
            >
              <div className="flex items-center gap-3">
                <div className="text-2xl">{agent.avatar}</div>
                <div>
                  <p className="font-medium text-white">{agent.name}</p>
                  <p className="text-xs text-slate-400">{agent.role}</p>
                </div>
              </div>
              <div className="mt-3">
                <div className="flex items-center gap-2">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      agent.status === "working"
                        ? "bg-green-400"
                        : agent.status === "building" || agent.status === "checking"
                        ? "bg-blue-400"
                        : "bg-slate-500"
                    }`}
                  />
                  <span className="text-xs text-slate-400 capitalize">{agent.status}</span>
                </div>
                <p className="text-xs text-slate-500 mt-2 line-clamp-2">{agent.current_task}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Pipeline Overview */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Operational Pipeline</h2>
        <div className="space-y-3">
          {pipelineItems?.map((item) => (
            <div
              key={item._id}
              className="flex items-center justify-between bg-slate-800/50 border border-slate-700 rounded-lg p-4"
            >
              <div className="flex-1">
                <p className="text-sm font-medium text-white">{item.name}</p>
                <p className="text-xs text-slate-400 mt-1">
                  {item.agent} • {item.time_in_stage} in {item.current_stage}
                </p>
              </div>
              <div
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  item.current_stage === "Data Collection"
                    ? "bg-blue-500/20 text-blue-400"
                    : item.current_stage === "Analysis"
                    ? "bg-purple-500/20 text-purple-400"
                    : item.current_stage === "Processing"
                    ? "bg-yellow-500/20 text-yellow-400"
                    : item.current_stage === "Quality Check"
                    ? "bg-cyan-500/20 text-cyan-400"
                    : "bg-green-500/20 text-green-400"
                }`}
              >
                {item.current_stage}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Memory */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Recent Memory</h2>
        <div className="space-y-3">
          {memoryEntries?.slice(0, 3).map((entry) => (
            <div
              key={entry._id}
              className="bg-slate-800/50 border border-slate-700 rounded-lg p-4"
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded">
                  {entry.brand}
                </span>
                <span className="text-xs px-2 py-0.5 bg-purple-500/20 text-purple-400 rounded">
                  {entry.platform}
                </span>
                <span className="text-xs text-slate-500">{entry.createdAt}</span>
              </div>
              <p className="text-sm text-slate-300 line-clamp-2">{entry.content}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
