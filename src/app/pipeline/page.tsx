"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { clsx } from "clsx";
import { ArrowRight, Clock, User, AlertTriangle, CheckCircle } from "lucide-react";

const stages = [
  { id: "Data Collection", color: "bg-blue-500", icon: "📥" },
  { id: "Analysis", color: "bg-purple-500", icon: "🔍" },
  { id: "Processing", color: "bg-yellow-500", icon: "⚙️" },
  { id: "Quality Check", color: "bg-cyan-500", icon: "✅" },
  { id: "Delivered", color: "bg-green-500", icon: "🚀" },
];

export default function PipelinePage() {
  const pipelineItems = useQuery(api.seed.getPipelineItems);

  const getStageIndex = (stage: string) => {
    return stages.findIndex((s) => s.id === stage);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Operational Pipeline</h1>
        <p className="text-slate-400 mt-1">Supply chain workflow management</p>
      </div>

      {/* Pipeline Flow */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <div className="flex items-center justify-between mb-8">
          {stages.map((stage, index) => (
            <div key={stage.id} className="flex items-center">
              <div className="flex flex-col items-center">
                <div className={clsx("w-12 h-12 rounded-full flex items-center justify-center text-xl", stage.color)}>
                  {stage.icon}
                </div>
                <span className="text-xs text-slate-400 mt-2">{stage.id}</span>
              </div>
              {index < stages.length - 1 && (
                <ArrowRight className="w-5 h-5 text-slate-600 mx-4" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Pipeline Items */}
      <div className="space-y-4">
        {pipelineItems?.map((item) => {
          const currentStageIndex = getStageIndex(item.current_stage);
          return (
            <div
              key={item._id}
              className="bg-slate-900 border border-slate-800 rounded-xl p-6"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white mb-2">{item.name}</h3>
                  <div className="flex items-center gap-4 text-sm text-slate-400">
                    <div className="flex items-center gap-1">
                      <User className="w-4 h-4" />
                      <span>{item.agent}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{item.time_in_stage} in stage</span>
                    </div>
                    {item.blockers && (
                      <div className="flex items-center gap-1 text-red-400">
                        <AlertTriangle className="w-4 h-4" />
                        <span>Blocked</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {stages.slice(0, currentStageIndex + 1).map((stage, index) => (
                    <div
                      key={stage.id}
                      className={clsx(
                        "w-3 h-3 rounded-full",
                        index === currentStageIndex ? stage.color : `${stage.color}/50`
                      )}
                    />
                  ))}
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mt-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-slate-500">Progress</span>
                  <span className="text-xs text-slate-400">
                    {currentStageIndex + 1} / {stages.length}
                  </span>
                </div>
                <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500"
                    style={{ width: `${((currentStageIndex + 1) / stages.length) * 100}%` }}
                  />
                </div>
              </div>

              {/* Metadata */}
              {item.metadata && (
                <div className="mt-4 flex gap-2">
                  {Object.entries(item.metadata).map(([key, value]) => (
                    <span
                      key={key}
                      className="text-xs px-2 py-1 bg-slate-800 text-slate-400 rounded"
                    >
                      {key}: {String(value)}
                    </span>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
