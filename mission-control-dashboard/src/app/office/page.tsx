"use client";

import { useEffect, useRef, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { clsx } from "clsx";

interface Agent {
  _id: string;
  name: string;
  role: string;
  status: string;
  current_task: string;
  avatar: string;
}

interface AgentState {
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  frame: number;
  isWalking: boolean;
  location: "desk" | "conference" | "dataroom" | "breakroom" | "lounge" | "athena_office";
}

const LOCATIONS = {
  athena_office: { x: 150, y: 120 },
  conference: { x: 400, y: 120 },
  breakroom: { x: 650, y: 120 },
  nexus_desk: { x: 100, y: 320 },
  atlas_desk: { x: 400, y: 320 },
  forge_desk: { x: 100, y: 520 },
  dataroom: { x: 400, y: 520 },
  lounge: { x: 750, y: 400 },
};

const AGENT_COLORS = {
  Athena: { primary: "#8B5CF6", shirt: "#8B5CF6" },
  Nexus: { primary: "#3B82F6", shirt: "#3B82F6" },
  Atlas: { primary: "#22C55E", shirt: "#22C55E" },
  Forge: { primary: "#F97316", shirt: "#F97316" },
};

export default function OfficePage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const agents = useQuery(api.seed.getAgents);
  const [agentStates, setAgentStates] = useState<Record<string, AgentState>>({});
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [camera, setCamera] = useState({ x: 0, y: 0 });
  const animationRef = useRef<number>(0);
  const lastUpdateRef = useRef<number>(0);

  useEffect(() => {
    if (!agents) return;

    setAgentStates((prev) => {
      const newStates = { ...prev };
      agents.forEach((agent: Agent) => {
        if (!newStates[agent.name]) {
          newStates[agent.name] = {
            x: 400,
            y: 400,
            targetX: 400,
            targetY: 400,
            frame: 0,
            isWalking: false,
            location: "lounge",
          };
        }

        const state = newStates[agent.name];
        const target = getTargetLocation(agent.status, agent.name);

        if (state.targetX !== target.x || state.targetY !== target.y) {
          state.targetX = target.x;
          state.targetY = target.y;
          state.isWalking = true;
          state.location = getLocation(agent.status);
        }
      });
      return newStates;
    });
  }, [agents]);

  const getTargetLocation = (status: string, name: string) => {
    switch (status) {
      case "working":
        return name === "Nexus" ? LOCATIONS.nexus_desk :
               name === "Atlas" ? LOCATIONS.atlas_desk :
               name === "Forge" ? LOCATIONS.forge_desk :
               LOCATIONS.athena_office;
      case "analyzing":
      case "analyzing_report":
        return LOCATIONS.conference;
      case "building":
        return LOCATIONS.forge_desk;
      case "checking":
      case "validating":
        return LOCATIONS.dataroom;
      case "idle":
      case "meeting":
        return Math.random() > 0.5 ? LOCATIONS.lounge : LOCATIONS.breakroom;
      default:
        return name === "Athena" ? LOCATIONS.athena_office :
               name === "Nexus" ? LOCATIONS.nexus_desk :
               name === "Atlas" ? LOCATIONS.atlas_desk :
               LOCATIONS.forge_desk;
    }
  };

  const getLocation = (status: string) => {
    switch (status) {
      case "working": return "desk";
      case "analyzing":
      case "analyzing_report": return "conference";
      case "building": return "desk";
      case "checking":
      case "validating": return "dataroom";
      case "idle":
      case "meeting": return "lounge";
      default: return "desk";
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const WIDTH = 1200;
    const HEIGHT = 700;
    canvas.width = WIDTH;
    canvas.height = HEIGHT;

    let frameCount = 0;

    const drawPixelRect = (x: number, y: number, w: number, h: number, color: string) => {
      ctx.fillStyle = color;
      ctx.fillRect(Math.floor(x - camera.x), Math.floor(y - camera.y), w, h);
    };

    const drawOffice = () => {
      // Floor - checkered pattern
      for (let y = 0; y < HEIGHT; y += 20) {
        for (let x = 0; x < WIDTH; x += 20) {
          const isLight = ((x / 20) + (y / 20)) % 2 === 0;
          drawPixelRect(x, y, 20, 20, isLight ? "#1e3a5f" : "#152238");
        }
      }

      // Top wall
      drawPixelRect(0, 0, WIDTH, 60, "#2d3748");
      
      // Room dividers
      // Vertical divider between rooms
      drawPixelRect(280, 60, 8, 200, "#4a5568");
      drawPixelRect(530, 60, 8, 200, "#4a5568");
      drawPixelRect(780, 60, 8, 200, "#4a5568");

      // Horizontal divider for desks
      drawPixelRect(0, 250, WIDTH - 300, 8, "#4a5568");
      drawPixelRect(700, 250, 300, 8, "#4a5568");
      drawPixelRect(0, 450, 700, 8, "#4a5568");
      drawPixelRect(700, 450, 300, 8, "#4a5568");

      // Room labels
      ctx.font = "14px JetBrains Mono, monospace";
      ctx.fillStyle = "#94a3b8";
      ctx.fillText("ATHENA'S OFFICE", 80 - camera.x, 90 - camera.y);
      ctx.fillText("CONFERENCE", 350 - camera.x, 90 - camera.y);
      ctx.fillText("BREAK ROOM", 600 - camera.x, 90 - camera.y);
      ctx.fillText("NEXUS", 100 - camera.x, 290 - camera.y);
      ctx.fillText("ATLAS", 400 - camera.x, 290 - camera.y);
      ctx.fillText("FORGE", 100 - camera.y > 450 ? 100 - camera.x : 100 - camera.x, 490 - camera.y);
      ctx.fillText("DATA ROOM", 400 - camera.x, 490 - camera.y);
      ctx.fillText("LOUNGE", 750 - camera.x, 390 - camera.y);
    };

    const drawConferenceRoom = () => {
      const cx = 400 - camera.x;
      const cy = 150 - camera.y;
      
      // Round table
      drawPixelRect(cx - 40, cy - 25, 80, 50, "#8B4513");
      drawPixelRect(cx - 35, cy - 20, 70, 40, "#A0522D");
      
      // Chairs around table
      const chairColors = ["#8B5CF6", "#3B82F6", "#22C55E", "#F97316"];
      for (let i = 0; i < 4; i++) {
        const angle = (i * Math.PI) / 2;
        const chairX = cx + Math.cos(angle) * 60 - 10;
        const chairY = cy + Math.sin(angle) * 35 - 8;
        drawPixelRect(chairX, chairY, 20, 16, chairColors[i]);
      }

      // Whiteboard
      drawPixelRect(320 - camera.x, 100 - camera.y, 80, 50, "#f8fafc");
      drawPixelRect(322 - camera.x, 102 - camera.y, 76, 46, "#e2e8f0");
      ctx.fillStyle = "#1e293b";
      ctx.font = "10px JetBrains Mono";
      ctx.fillText("Q1 Goals", 330 - camera.x, 120 - camera.y);
      ctx.fillText("- 40 brands", 330 - camera.x, 135 - camera.y);
    };

    const drawAthenaOffice = () => {
      const ax = 100 - camera.x;
      const ay = 120 - camera.y;
      
      // Executive desk
      drawPixelRect(ax, ay + 30, 120, 40, "#1e3a5f");
      drawPixelRect(ax + 10, ay + 40, 100, 25, "#0f172a");
      
      // Executive chair
      drawPixelRect(ax + 45, ay + 60, 30, 25, "#8B5CF6");
      
      // Bookshelf
      drawPixelRect(ax + 130, ay, 30, 80, "#78350f");
      for (let i = 0; i < 4; i++) {
        drawPixelRect(ax + 132, ay + 5 + i * 20, 26, 15, i % 2 === 0 ? "#dc2626" : "#2563eb");
      }
      
      // Globe
      drawPixelRect(ax + 10, ay - 25, 20, 20, "#3B82F6");
    };

    const drawNexusDesk = () => {
      const nx = 100 - camera.x;
      const ny = 320 - camera.y;
      
      // Desk
      drawPixelRect(nx, ny + 30, 120, 35, "#475569");
      
      // Multiple monitors
      drawPixelRect(nx + 10, ny, 40, 30, "#1e293b");
      drawPixelRect(nx + 12, ny + 2, 36, 26, "#0ea5e9");
      drawPixelRect(nx + 55, ny, 40, 30, "#1e293b");
      drawPixelRect(nx + 57, ny + 2, 36, 26, "#0ea5e9");
      
      // Chart on screen
      ctx.fillStyle = "#22c55e";
      ctx.fillRect(nx + 15 - camera.x, ny + 10 - camera.y, 8, 8);
      ctx.fillRect(nx + 25 - camera.x, ny + 6 - camera.y, 8, 8);
      ctx.fillRect(nx + 35 - camera.x, ny + 12 - camera.y, 8, 8);
      
      // Calculator
      drawPixelRect(nx + 80, ny + 35, 25, 20, "#334155");
    };

    const drawAtlasDesk = () => {
      const ax = 400 - camera.x;
      const ay = 320 - camera.y;
      
      // Desk
      drawPixelRect(ax, ay + 30, 120, 35, "#475569");
      
      // Monitor
      drawPixelRect(ax + 40, ay, 40, 30, "#1e293b");
      drawPixelRect(ax + 42, ay + 2, 36, 26, "#22C55E");
      
      // Clipboard with checklist
      drawPixelRect(ax + 10, ay + 35, 20, 30, "#78716c");
      ctx.fillStyle = "#fff";
      ctx.fillRect(ax + 12 - camera.x, ay + 38 - camera.y, 16, 8);
      ctx.fillRect(ax + 12 - camera.x, ay + 50 - camera.y, 16, 8);
      
      // Magnifying glass
      drawPixelRect(ax + 90, ay + 10, 8, 8, "#94a3b8");
      drawPixelRect(ax + 96, ay + 16, 8, 3, "#78716c");
    };

    const drawForgeDesk = () => {
      const fx = 100 - camera.x;
      const fy = 520 - camera.y;
      
      // Desk
      drawPixelRect(fx, fy + 30, 120, 35, "#475569");
      
      // Terminal monitors
      drawPixelRect(fx + 10, fy, 70, 30, "#0f172a");
      ctx.fillStyle = "#22c55e";
      ctx.font = "8px JetBrains Mono";
      ctx.fillText("> python analyze.py", fx + 15 - camera.x, fy + 15 - camera.y);
      
      // Coffee mug
      drawPixelRect(fx + 90, fy + 35, 12, 15, "#78716c");
      drawPixelRect(fx + 102, fy + 38, 5, 8, "#78716c");
      
      // Tools
      drawPixelRect(fx + 85, fy + 55, 8, 20, "#71717a");
    };

    const drawDataRoom = () => {
      const dx = 400 - camera.x;
      const dy = 520 - camera.y;
      
      // Server racks
      for (let i = 0; i < 3; i++) {
        drawPixelRect(dx + i * 45, dy, 40, 70, "#1e293b");
        // Blinking lights
        const blink = (frameCount + i * 10) % 20 < 10;
        drawPixelRect(dx + i * 45 + 5, dy + 5, 6, 6, blink ? "#22c55e" : "#166534");
        drawPixelRect(dx + i * 45 + 5, dy + 15, 6, 6, blink ? "#ef4444" : "#991b1b");
      }
      
      // Filing cabinets
      drawPixelRect(dx + 150, dy, 30, 50, "#64748b");
      ctx.fillStyle = "#fff";
      ctx.font = "8px JetBrains Mono";
      ctx.fillText("Talabat", dx + 152 - camera.x, dy + 15 - camera.y);
      ctx.fillText("Data", dx + 152 - camera.x, dy + 30 - camera.y);
    };

    const drawLounge = () => {
      const lx = 750 - camera.x;
      const ly = 400 - camera.y;
      
      // Couch
      drawPixelRect(lx, ly + 20, 80, 30, "#7c3aed");
      drawPixelRect(lx, ly + 10, 80, 15, "#6d28d9");
      
      // Ping pong table
      drawPixelRect(lx + 100, ly, 60, 35, "#15803d");
      drawPixelRect(lx + 105, ly + 5, 50, 25, "#166534");
      
      // Whiteboard
      drawPixelRect(lx + 100, ly - 50, 60, 40, "#f8fafc");
      ctx.fillStyle = "#1e293b";
      ctx.font = "8px JetBrains Mono";
      ctx.fillText("Ideas:", lx + 105 - camera.x, ly - 35 - camera.y);
      ctx.fillText("- Auto-CSV", lx + 105 - camera.x, ly - 22 - camera.y);
      
      // Plants
      drawPixelRect(lx - 20, ly + 20, 15, 30, "#166534");
      drawPixelRect(lx - 15, ly + 10, 5, 15, "#22c55e");
    };

    const drawBreakRoom = () => {
      const bx = 650 - camera.x;
      const by = 120 - camera.y;
      
      // Coffee maker
      drawPixelRect(bx, by + 20, 30, 40, "#71717a");
      drawPixelRect(bx + 5, by + 25, 20, 15, "#0f172a");
      
      // Fridge
      drawPixelRect(bx + 40, by + 10, 35, 60, "#e2e8f0");
      drawPixelRect(bx + 42, by + 15, 31, 25, "#94a3b8");
      drawPixelRect(bx + 42, by + 43, 31, 24, "#94a3b8");
      
      // Small table
      drawPixelRect(bx + 10, by + 70, 40, 25, "#78350f");
    };

    const drawAgent = (name: string, state: AgentState, agent: Agent) => {
      const { x, y, isWalking, frame } = state;
      const color = AGENT_COLORS[name as keyof typeof AGENT_COLORS];
      
      const drawX = Math.floor(x - camera.x);
      const drawY = Math.floor(y - camera.y);
      
      // Body
      const bodyOffset = isWalking ? (frame % 4 < 2 ? 0 : 2) : 0;
      drawPixelRect(drawX + 4, drawY + 15 - bodyOffset, 16, 20, color.shirt);
      
      // Head
      drawPixelRect(drawX + 6, drawY + 2, 12, 14, "#fbbf24");
      
      // Eyes
      drawPixelRect(drawX + 8, drawY + 6, 2, 2, "#1e293b");
      drawPixelRect(drawX + 14, drawY + 6, 2, 2, "#1e293b");
      
      // Legs
      const legOffset = isWalking ? (frame % 4 < 2 ? 0 : 3) : 0;
      drawPixelRect(drawX + 6, drawY + 35 - legOffset, 4, 10, "#1e293b");
      drawPixelRect(drawX + 14, drawY + 35 + legOffset - 3, 4, 10, "#1e293b");
      
      // Arms
      const armOffset = isWalking ? (frame % 4 < 2 ? 0 : 2) : 0;
      drawPixelRect(drawX + 2, drawY + 17 - armOffset, 4, 12, color.shirt);
      drawPixelRect(drawX + 18, drawY + 17 + armOffset - 2, 4, 12, color.shirt);
      
      // Status bubble
      if (agent.current_task && agent.current_task.length > 0) {
        ctx.fillStyle = "#1e293b";
        ctx.fillRect(drawX - 10, drawY - 20, Math.min(agent.current_task.length * 4, 80), 16);
        ctx.fillStyle = "#fff";
        ctx.font = "8px JetBrains Mono";
        const text = agent.current_task.length > 20 ? agent.current_task.slice(0, 20) + "..." : agent.current_task;
        ctx.fillText(text, drawX - 8, drawY - 8);
      }
    };

    const updateAgents = () => {
      setAgentStates((prev) => {
        const newStates = { ...prev };
        Object.keys(newStates).forEach((name) => {
          const state = newStates[name];
          const dx = state.targetX - state.x;
          const dy = state.targetY - state.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist > 2) {
            const speed = 2;
            state.x += (dx / dist) * speed;
            state.y += (dy / dist) * speed;
            state.frame++;
            state.isWalking = true;
          } else {
            state.x = state.targetX;
            state.y = state.targetY;
            state.isWalking = false;
          }
        });
        return newStates;
      });
    };

    const render = () => {
      frameCount++;
      
      // Clear
      ctx.fillStyle = "#0f172a";
      ctx.fillRect(0, 0, WIDTH, HEIGHT);
      
      // Draw office
      drawOffice();
      drawConferenceRoom();
      drawAthenaOffice();
      drawNexusDesk();
      drawAtlasDesk();
      drawForgeDesk();
      drawDataRoom();
      drawLounge();
      drawBreakRoom();
      
      // Update and draw agents
      if (frameCount % 10 === 0) {
        updateAgents();
      }
      
      if (agents) {
        agents.forEach((agent: Agent) => {
          const state = agentStates[agent.name];
          if (state) {
            drawAgent(agent.name, state, agent);
          }
        });
      }
      
      animationRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [agents, agentStates, camera]);

  useEffect(() => {
    if (selectedAgent && agentStates[selectedAgent]) {
      const state = agentStates[selectedAgent];
      setCamera({ x: Math.max(0, state.x - 600), y: Math.max(0, state.y - 350) });
    }
  }, [selectedAgent, agentStates]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "working": return "bg-green-500";
      case "analyzing":
      case "analyzing_report": return "bg-yellow-500";
      case "building": return "bg-orange-500";
      case "checking":
      case "validating": return "bg-cyan-500";
      default: return "bg-gray-500";
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-white">Digital Office</h1>
        <p className="text-slate-400 mt-1">Real-time visualization of your Mantaga team</p>
      </div>

      <div className="flex-1 relative">
        <canvas
          ref={canvasRef}
          className="w-full h-full rounded-xl border border-slate-700"
          style={{ backgroundColor: "#0f172a" }}
        />

        {/* Controls */}
        <div className="absolute top-4 right-4 flex gap-2">
          <button
            onClick={() => setCamera({ x: 0, y: 0 })}
            className="px-3 py-1 bg-slate-800 text-slate-300 rounded text-sm hover:bg-slate-700"
          >
            Reset View
          </button>
        </div>
      </div>

      {/* Status Bar */}
      <div className="mt-4 bg-slate-900 border border-slate-800 rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-slate-400">Team Status</h3>
          <span className="text-xs text-slate-500">Click agent to focus</span>
        </div>
        
        <div className="grid grid-cols-4 gap-4">
          {agents?.map((agent: Agent) => (
            <button
              key={agent._id}
              onClick={() => setSelectedAgent(agent.name)}
              className={clsx(
                "flex items-center gap-3 p-3 rounded-lg transition-all text-left",
                selectedAgent === agent.name ? "bg-slate-800 border border-slate-600" : "bg-slate-800/50 hover:bg-slate-800"
              )}
            >
              <div className="text-2xl">{agent.avatar}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <div className={clsx("w-2 h-2 rounded-full", getStatusColor(agent.status))} />
                  <span className="font-medium text-white text-sm">{agent.name}</span>
                </div>
                <p className="text-xs text-slate-400 capitalize truncate">{agent.status}</p>
                <p className="text-xs text-slate-500 truncate">{agent.current_task}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Instructions */}
      <div className="mt-4 text-xs text-slate-500">
        <p>Agents move automatically based on their status. Watch them work in real-time!</p>
      </div>
    </div>
  );
}
