"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { clsx } from "clsx";
import { Calendar, User, Flag } from "lucide-react";

const columns = [
  { id: "recurring", label: "Recurring", color: "bg-blue-500" },
  { id: "backlog", label: "Backlog", color: "bg-slate-500" },
  { id: "in_progress", label: "In Progress", color: "bg-yellow-500" },
  { id: "review", label: "Review", color: "bg-purple-500" },
  { id: "done", label: "Done", color: "bg-green-500" },
];

const taskTypes = [
  { id: "CSV Processing", color: "bg-emerald-500/20 text-emerald-400" },
  { id: "Inventory Analysis", color: "bg-blue-500/20 text-blue-400" },
  { id: "SKU Validation", color: "bg-purple-500/20 text-purple-400" },
  { id: "Compliance Checks", color: "bg-orange-500/20 text-orange-400" },
  { id: "Client Reports", color: "bg-cyan-500/20 text-cyan-400" },
];

const priorityColors = {
  high: "text-red-400",
  medium: "text-yellow-400",
  low: "text-green-400",
};

export default function TasksPage() {
  const tasks = useQuery(api.seed.getTasks);

  const getTasksByStatus = (status: string) => {
    return tasks?.filter((t) => t.status === status) || [];
  };

  return (
    <div className="h-full">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Tasks Board</h1>
        <p className="text-slate-400 mt-1">Track all operational tasks for Mantaga</p>
      </div>

      <div className="grid grid-cols-5 gap-4 h-[calc(100vh-180px)]">
        {columns.map((column) => (
          <div key={column.id} className="flex flex-col">
            <div className="flex items-center gap-2 mb-4">
              <div className={clsx("w-3 h-3 rounded-full", column.color)} />
              <h2 className="font-semibold text-white">{column.label}</h2>
              <span className="text-xs text-slate-500 ml-auto">
                {getTasksByStatus(column.id).length}
              </span>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto">
              {getTasksByStatus(column.id).map((task) => {
                const taskType = taskTypes.find((t) => t.id === task.type);
                return (
                  <div
                    key={task._id}
                    className="bg-slate-900 border border-slate-800 rounded-lg p-4 hover:border-slate-700 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <span
                        className={clsx(
                          "text-xs px-2 py-0.5 rounded",
                          taskType?.color || "bg-slate-500/20 text-slate-400"
                        )}
                      >
                        {task.type}
                      </span>
                      <Flag className={clsx("w-4 h-4", priorityColors[task.priority as keyof typeof priorityColors])} />
                    </div>

                    <h3 className="font-medium text-white text-sm mb-2">{task.title}</h3>
                    <p className="text-xs text-slate-400 line-clamp-2 mb-3">{task.description}</p>

                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <div className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        <span>{task.assignee}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>{task.deadline}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
