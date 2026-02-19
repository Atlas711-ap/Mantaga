"use client";

import { useState, useRef, useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { clsx } from "clsx";
import { Send, AtSign, Code, Clock, MessageSquare } from "lucide-react";

const agentColors = {
  Athena: { bg: "bg-purple-500/20", border: "border-purple-500/30", text: "text-purple-400", name: "👑 Athena" },
  Nexus: { bg: "bg-blue-500/20", border: "border-blue-500/30", text: "text-blue-400", name: "⚡ Nexus" },
  Atlas: { bg: "bg-green-500/20", border: "border-green-500/30", text: "text-green-400", name: "🛡️ Atlas" },
  Forge: { bg: "bg-orange-500/20", border: "border-orange-500/30", text: "text-orange-400", name: "🔨 Forge" },
};

const agents = ["Athena", "Nexus", "Atlas", "Forge"];

export default function ChatPage() {
  const [message, setMessage] = useState("");
  const [selectedAgent, setSelectedAgent] = useState("Nexus");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const messages = useQuery(api.seed.getMessages);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    if (!message.trim()) return;
    // In a real app, this would call a convex mutation
    console.log("Sending:", { content: message, agent: selectedAgent });
    setMessage("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const insertMention = (agent: string) => {
    setMessage((prev) => prev + `@${agent} `);
  };

  const formatTime = (timestamp: string) => {
    try {
      const [date, time] = timestamp.split(" ");
      return time || date;
    } catch {
      return timestamp;
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-white">Agent Chat Room</h1>
        <p className="text-slate-400 mt-1">Real-time team communication hub</p>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-4 min-h-0">
        {/* Messages Panel */}
        <div className="lg:col-span-3 flex flex-col bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages?.map((msg, index) => {
              const agentStyle = agentColors[msg.agent as keyof typeof agentColors] || agentColors.Nexus;
              const isLast = index === messages.length - 1;
              
              return (
                <div
                  key={msg._id}
                  className={clsx(
                    "flex gap-3",
                    isLast && "animate-fade-in"
                  )}
                >
                  <div className={clsx("w-10 h-10 rounded-full flex items-center justify-center text-lg", agentStyle.bg)}>
                    {msg.agent === "Athena" && "👑"}
                    {msg.agent === "Nexus" && "⚡"}
                    {msg.agent === "Atlas" && "🛡️"}
                    {msg.agent === "Forge" && "🔨"}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={clsx("font-medium", agentStyle.text)}>{msg.agent}</span>
                      <span className="text-xs text-slate-500">{formatTime(msg.createdAt)}</span>
                      {msg.mentions.length > 0 && (
                        <div className="flex gap-1">
                          {msg.mentions.map((mention) => (
                            <span
                              key={mention}
                              className="text-xs px-1.5 py-0.5 bg-slate-700 text-slate-300 rounded"
                            >
                              @{mention}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-3">
                      <p className="text-slate-300 whitespace-pre-wrap">{msg.content}</p>
                    </div>
                  </div>
                </div>
              );
            })}
            
            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-lg">⚡</div>
                <div className="bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-3">
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

          {/* Input */}
          <div className="border-t border-slate-800 p-4">
            <div className="flex gap-2 mb-2">
              <span className="text-xs text-slate-500">Post as:</span>
              <div className="flex gap-1">
                {agents.map((agent) => (
                  <button
                    key={agent}
                    onClick={() => setSelectedAgent(agent)}
                    className={clsx(
                      "text-xs px-2 py-0.5 rounded transition-colors",
                      selectedAgent === agent
                        ? agentColors[agent as keyof typeof agentColors].bg + " " + agentColors[agent as keyof typeof agentColors].text
                        : "text-slate-500 hover:text-slate-300"
                    )}
                  >
                    {agent}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <div className="flex gap-1">
                {agents.map((agent) => (
                  <button
                    key={agent}
                    onClick={() => insertMention(agent)}
                    className="p-2 text-slate-500 hover:text-slate-300 hover:bg-slate-800 rounded transition-colors"
                    title={`Mention ${agent}`}
                  >
                    <AtSign className="w-4 h-4" />
                  </button>
                ))}
              </div>
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type a message... (Press Enter to send)"
                className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              />
              <button
                onClick={handleSend}
                disabled={!message.trim()}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Online Agents */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <h3 className="text-sm font-medium text-slate-400 mb-3">Team Members</h3>
            <div className="space-y-2">
              {agents.map((agent) => {
                const style = agentColors[agent as keyof typeof agentColors];
                return (
                  <div
                    key={agent}
                    className="flex items-center gap-2 p-2 rounded-lg hover:bg-slate-800/50"
                  >
                    <div className="relative">
                      <div className={clsx("w-8 h-8 rounded-full flex items-center justify-center text-sm", style.bg)}>
                        {agent === "Athena" && "👑"}
                        {agent === "Nexus" && "⚡"}
                        {agent === "Atlas" && "🛡️"}
                        {agent === "Forge" && "🔨"}
                      </div>
                      <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-slate-900" />
                    </div>
                    <div>
                      <p className="text-sm text-white">{agent}</p>
                      <p className="text-xs text-slate-500 capitalize">
                        {agent === "Athena" && "working"}
                        {agent === "Nexus" && "processing"}
                        {agent === "Atlas" && "checking"}
                        {agent === "Forge" && "building"}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Mentions */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <h3 className="text-sm font-medium text-slate-400 mb-3">Quick Mentions</h3>
            <div className="space-y-2">
              {agents.map((agent) => (
                <button
                  key={agent}
                  onClick={() => insertMention(agent)}
                  className="w-full text-left p-2 text-sm text-slate-300 hover:bg-slate-800 rounded-lg transition-colors"
                >
                  @{agent}
                </button>
              ))}
              <button
                onClick={() => setMessage("@team ")}
                className="w-full text-left p-2 text-sm text-blue-400 hover:bg-slate-800 rounded-lg transition-colors"
              >
                @all (team)
              </button>
            </div>
          </div>

          {/* Info */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <div className="flex items-center gap-2 text-slate-400 mb-2">
              <MessageSquare className="w-4 h-4" />
              <span className="text-sm">Chat Info</span>
            </div>
            <p className="text-xs text-slate-500">
              Last 100 messages visible. Use @mentions to notify specific agents.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
