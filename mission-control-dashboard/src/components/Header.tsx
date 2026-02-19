"use client";

import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

const tabNames: Record<string, string> = {
  "/": "Dashboard",
  "/team": "Team",
  "/chatroom": "Chatroom",
  "/calendar": "Calendar",
  "/upload": "Data Upload",
  "/brand-performance": "Brand Performance",
  "/customer-performance": "Customer Performance",
  "/sku-list": "SKU List",
};

const agents = [
  { name: "Athena", initials: "AT", color: "bg-amber-500" },
  { name: "Nexus", initials: "NX", color: "bg-cyan-500" },
  { name: "Atlas", initials: "AS", color: "bg-emerald-500" },
  { name: "Forge", initials: "FG", color: "bg-violet-500" },
];

export default function Header() {
  const pathname = usePathname();
  const [time, setTime] = useState("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const dubaiTime = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Dubai" }));
      setTime(dubaiTime.toLocaleString("en-GB", {
        weekday: "short",
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }));
    };
    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="h-16 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-6">
      <div className="text-sm font-medium text-white">
        {tabNames[pathname] || "Dashboard"}
      </div>

      <div className="flex items-center gap-2">
        {agents.map((agent) => (
          <div
            key={agent.name}
            className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-[10px] text-white font-medium"
            title={`${agent.name}: IDLE`}
          >
            {agent.initials}
          </div>
        ))}
      </div>

      <div className="text-sm text-slate-400">
        {time}
      </div>
    </header>
  );
}
