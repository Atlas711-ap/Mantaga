"use client";

export const dynamic = 'force-dynamic';

import { useState, useRef, useEffect } from "react";
import { useMessages, useInsertMessage, useKnowledgeBase } from "../../hooks/useConvex";
import { detectAgentMention, routeToAgent } from "../../lib/agent-response";

interface Message {
  id: string;
  sender: string;
  sender_type: "agent" | "user" | "system";
  timestamp: string;
  content: string;
  badge?: string;
  attachment?: string;
}

interface Agent {
  id: string;
  name: string;
  role: string;
  color: string;
  status: "ACTIVE" | "IDLE" | "ERROR";
}

const agents: Agent[] = [
  { id: "athena", name: "Athena", role: "CEO", color: "#F59E0B", status: "ACTIVE" },
  { id: "nexus", name: "Nexus", role: "Operations", color: "#06B6D4", status: "ACTIVE" },
  { id: "atlas", name: "Atlas", role: "SKU Coordinator", color: "#10B981", status: "IDLE" },
  { id: "forge", name: "Forge", role: "Developer", color: "#8B5CF6", status: "IDLE" },
];

const recentActivity = [
  { agent: "Nexus", action: "Stock report processed", time: "2h ago" },
  { agent: "Atlas", action: "SKU data validated", time: "4h ago" },
  { agent: "Athena", action: "Daily brief sent", time: "5h ago" },
  { agent: "Forge", action: "System health check", time: "6h ago" },
  { agent: "Nexus", action: "Invoice matched", time: "7h ago" },
];

const quickActions = [
  { label: "📊 Ask for stock update", prompt: "@nexus What is the current stock status across all darkstores?" },
  { label: "📋 Ask for SKU check", prompt: "@atlas Are there any incomplete SKU records?" },
  { label: "🔍 Ask for daily summary", prompt: "@athena Give me a quick summary of today's operations" },
];

export default function ChatroomPage() {
  const messagesData = useMessages();
  const insertMessage = useInsertMessage();
  const knowledgeBaseData = useKnowledgeBase();
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [showMentionDropdown, setShowMentionDropdown] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Sync Convex messages to local state
  useEffect(() => {
    if (messagesData) {
      const formatted: Message[] = messagesData.map(m => ({
        id: m._id,
        sender: m.sender,
        sender_type: m.sender_type as "agent" | "user" | "system",
        timestamp: new Date(m.timestamp).toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }),
        content: m.content,
        badge: m.is_system_message ? "⚙️ SYSTEM" : undefined,
      }));
      setMessages(formatted);
    }
  }, [messagesData]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const newMessage: Message = {
      id: Date.now().toString(),
      sender: "Anush",
      sender_type: "user",
      timestamp: new Date().toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }),
      content: input,
    };
    
    // Optimistic update
    setMessages([...messages, newMessage]);
    setInput("");
    
    // Save to Convex
    try {
      await insertMessage({
        sender: "Anush",
        sender_type: "user",
        content: input,
        timestamp: new Date().toISOString(),
        is_system_message: false,
      });
    } catch (error) {
      console.error("Failed to save message:", error);
    }
    
    // Simulate agent response using real agent system
    setIsTyping(true);
    
    // Get knowledge base content
    const kbContent = knowledgeBaseData 
      ? knowledgeBaseData.map(k => `${k.key}: ${k.value}`).join("\n")
      : "No knowledge base data yet.";
    
    // Detect which agent to route to
    const agentId = detectAgentMention(input);
    
    if (agentId) {
      // Route to specific agent
      const response = await routeToAgent(input, agentId, kbContent);
      setIsTyping(false);
      const agentMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: agentId.charAt(0).toUpperCase() + agentId.slice(1),
        sender_type: "agent",
        timestamp: new Date().toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }),
        content: response,
      };
      setMessages(prev => [...prev, agentMsg]);
    } else {
      // No @mention - respond from Nexus as default
      setTimeout(async () => {
        const response = await routeToAgent(input, "nexus", kbContent);
        setIsTyping(false);
        const agentMsg: Message = {
          id: (Date.now() + 1).toString(),
          sender: "Nexus",
          sender_type: "agent",
          timestamp: new Date().toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }),
          content: response,
        };
        setMessages(prev => [...prev, agentMsg]);
      }, 1500);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
    if (e.target.value.includes("@")) {
      setShowMentionDropdown(true);
    } else {
      setShowMentionDropdown(false);
    }
  };

  const insertMention = (agentName: string) => {
    setInput(`@${agentName.toLowerCase()} `);
    setShowMentionDropdown(false);
  };

  const handleQuickAction = (prompt: string) => {
    setInput(prompt);
  };

  return (
    <div className="h-[calc(100vh-180px)] flex gap-4">
      {/* LEFT PANEL */}
      <div className="w-[200px] bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col">
        <div className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-4">AGENTS ONLINE</div>
        
        {/* GROUP */}
        <button
          onClick={() => setSelectedAgent(null)}
          className={`flex items-center gap-2 p-2 rounded-lg mb-2 ${
            selectedAgent === null ? "bg-amber-500/10 border-l-2 border-amber-500" : "hover:bg-slate-800"
          }`}
        >
          <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs text-white font-medium">GR</div>
          <span className="text-sm text-white">Group</span>
        </button>
        
        {/* Agents */}
        {agents.map((agent) => (
          <button
            key={agent.id}
            onClick={() => insertMention(agent.name)}
            className={`flex items-center gap-2 p-2 rounded-lg mb-1 ${
              selectedAgent === agent.id ? "bg-amber-500/10 border-l-2 border-amber-500" : "hover:bg-slate-800"
            }`}
          >
            <div 
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium"
              style={{ backgroundColor: `${agent.color}33`, color: agent.color, border: `2px solid ${agent.color}` }}
            >
              {agent.name.slice(0, 2).toUpperCase()}
            </div>
            <span className="text-sm text-slate-300">{agent.name}</span>
            <div className={`w-2 h-2 rounded-full ml-auto ${
              agent.status === "ACTIVE" ? "bg-green-500" : "bg-slate-500"
            }`} />
          </button>
        ))}
      </div>

      {/* CENTER PANEL - MESSAGE FEED */}
      <div className="flex-1 bg-slate-900 border border-slate-800 rounded-xl flex flex-col">
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.sender_type === "user" ? "justify-end" : msg.sender_type === "system" ? "justify-center" : "justify-start"}`}>
              {msg.sender_type === "system" ? (
                <div className="bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2 text-xs text-slate-400 italic max-w-[80%] text-center">
                  {msg.content}
                </div>
              ) : msg.sender_type === "user" ? (
                <div className="max-w-[70%]">
                  <div className="text-right mb-1">
                    <span className="text-xs text-amber-400 font-medium">Anush</span>
                  </div>
                  <div className="text-right mt-1">
                    <span className="text-xs text-slate-500">{msg.timestamp}</span>
                  </div>
                </div>
              ) : (
                <div className="max-w-[70%]">
                  {msg.badge && (
                    <div className="flex justify-end mb-1">
                      <span className="text-[10px] px-2 py-0.5 bg-slate-700 text-slate-400 rounded-full">
                        {msg.badge}
                      </span>
                    </div>
                  )}
                  <div className="flex items-start gap-2">
                    <div 
                      className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium shrink-0"
                      style={{ 
                        backgroundColor: `${agents.find(a => a.name === msg.sender)?.color}33`, 
                        border: `2px solid ${agents.find(a => a.name === msg.sender)?.color}` 
                      }}
                    >
                      {msg.sender.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span 
                          className="text-xs font-medium"
                          style={{ color: agents.find(a => a.name === msg.sender)?.color }}
                        >
                          {msg.sender}
                        </span>
                      </div>
                      <div 
                        className={`px-4 py-3 rounded-xl rounded-tl-none text-sm text-slate-200 ${
                          msg.badge === "📋 DAILY BRIEF" 
                            ? "bg-slate-800 border-t-2 border-amber-500" 
                            : "bg-slate-800"
                        }`}
                      >
                        <pre className="whitespace-pre-wrap font-sans">{msg.content}</pre>
                      </div>
                      <div className="text-xs text-slate-500 mt-1">{msg.timestamp}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
          
          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-cyan-500/20 flex items-center justify-center text-sm" style={{ border: "2px solid #06B6D4" }}>NX</div>
              <div className="bg-slate-800 rounded-xl px-4 py-3">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" />
                  <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:0.1s]" />
                  <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-4 border-t border-slate-800">
          <div className="relative">
            {showMentionDropdown && (
              <div className="absolute bottom-full mb-2 left-0 w-48 bg-slate-800 border border-slate-700 rounded-lg overflow-hidden">
                {agents.map((agent) => (
                  <button
                    key={agent.id}
                    onClick={() => insertMention(agent.name)}
                    className="flex items-center gap-2 w-full p-2 hover:bg-slate-700 text-left"
                  >
                    <div 
                      className="w-6 h-6 rounded-full flex items-center justify-center text-[10px]"
                      style={{ backgroundColor: `${agent.color}33`, color: agent.color }}
                    >
                      {agent.name.slice(0, 2).toUpperCase()}
                    </div>
                    <span className="text-sm text-slate-300">{agent.name}</span>
                  </button>
                ))}
              </div>
            )}
            <div className="flex gap-2">
              <button className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                </svg>
              </button>
              <input
                type="text"
                value={input}
                onChange={handleInputChange}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                placeholder="Message the team or @mention a specific agent..."
                className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim()}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 disabled:bg-slate-700 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-2 9 2 9-9 2-9-2 9 2 9-9 2-9-2 9" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="w-[240px] space-y-6">
        {/* Quick Actions */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-3">Quick Actions</div>
          <div className="space-y-2">
            {quickActions.map((action, i) => (
              <button
                key={i}
                onClick={() => handleQuickAction(action.prompt)}
                className="w-full text-left p-3 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm text-slate-300 transition-colors"
              >
                {action.label}
              </button>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-3">Recent Activity</div>
          <div className="space-y-3">
            {recentActivity.map((activity, i) => {
              const agent = agents.find(a => a.name === activity.agent);
              return (
                <div key={i} className="flex items-start gap-2">
                  <div className="w-2 h-2 rounded-full mt-1.5" style={{ backgroundColor: agent?.color || "#666" }} />
                  <div>
                    <div className="text-xs" style={{ color: agent?.color }}>{activity.agent}</div>
                    <div className="text-xs text-slate-500">{activity.action}</div>
                    <div className="text-[10px] text-slate-600">{activity.time}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
