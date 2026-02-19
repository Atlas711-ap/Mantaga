"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ListTodo,
  GitBranch,
  Calendar,
  Brain,
  Users,
  BarChart3,
  Settings,
  Building2,
} from "lucide-react";
import { clsx } from "clsx";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/tasks", label: "Tasks Board", icon: ListTodo },
  { href: "/pipeline", label: "Pipeline", icon: GitBranch },
  { href: "/chat", label: "Agent Chat", icon: Brain },
  { href: "/calendar", label: "Calendar", icon: Calendar },
  { href: "/memory", label: "Memory", icon: Brain },
  { href: "/office", label: "Digital Office", icon: Building2 },
  { href: "/team", label: "Team", icon: Users },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col">
      <div className="p-6 border-b border-slate-800">
        <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
          MANTAGA
        </h1>
        <p className="text-xs text-slate-500 mt-1">Mission Control</p>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                "flex items-center gap-3 px-4 py-3 rounded-lg transition-all",
                isActive
                  ? "bg-blue-600/20 text-blue-400 border border-blue-600/30"
                  : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
              )}
            >
              <Icon className="w-5 h-5" />
              <span className="text-sm font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <div className="flex items-center gap-3 px-4 py-3">
          <Settings className="w-5 h-5 text-slate-500" />
          <span className="text-sm text-slate-500">Settings</span>
        </div>
      </div>
    </aside>
  );
}
