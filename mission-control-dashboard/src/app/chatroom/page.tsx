export default function ChatroomPage() {
  const agents = [
    { name: "Athena", status: "IDLE", color: "amber" },
    { name: "Nexus", status: "IDLE", color: "cyan" },
    { name: "Atlas", status: "IDLE", color: "emerald" },
    { name: "Forge", status: "IDLE", color: "violet" },
  ];

  const messages = [
    { sender: "System", type: "system", text: "System initialized — all agents online", time: "15:00" },
  ];

  return (
    <div className="h-[calc(100vh-180px)] flex gap-4">
      {/* Left Panel - Agent List */}
      <div className="w-[200px] bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col">
        <div className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-4">Agents Online</div>
        
        <div className="space-y-2">
          <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-800">
            <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs text-white">GR</div>
            <span className="text-sm text-white">Group</span>
          </div>
          
          {agents.map((agent) => (
            <div key={agent.name} className="flex items-center gap-2 p-2 hover:bg-slate-800 rounded-lg cursor-pointer">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                agent.color === "amber" ? "bg-amber-500/20 text-amber-400" :
                agent.color === "cyan" ? "bg-cyan-500/20 text-cyan-400" :
                agent.color === "emerald" ? "bg-emerald-500/20 text-emerald-400" :
                "bg-violet-500/20 text-violet-400"
              }`}>
                {agent.name.slice(0, 2).toUpperCase()}
              </div>
              <span className="text-sm text-slate-300">{agent.name}</span>
              <div className="w-2 h-2 rounded-full bg-slate-500 ml-auto"></div>
            </div>
          ))}
        </div>
      </div>

      {/* Center Panel - Message Feed */}
      <div className="flex-1 bg-slate-900 border border-slate-800 rounded-xl flex flex-col">
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length > 0 ? messages.map((msg, i) => (
            msg.type === "system" ? (
              <div key={i} className="text-center">
                <div className="inline-block bg-slate-700 rounded-lg px-4 py-2 text-xs text-slate-400 italic">
                  {msg.text}
                </div>
              </div>
            ) : null
          )) : (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-sm text-slate-500">No messages yet — agents will post here after first file upload</p>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="p-4 border-t border-slate-800">
          <div className="flex gap-2">
            <button className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
              </svg>
            </button>
            <input
              type="text"
              placeholder="Message all agents or @mention one specifically..."
              className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none"
            />
            <button className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-sm font-medium">
              Send
            </button>
          </div>
        </div>
      </div>

      {/* Right Panel - Quick Actions */}
      <div className="w-[240px] bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-6">
        <div>
          <div className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-3">Quick Actions</div>
          <button className="w-full text-left p-3 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm text-slate-300">
            @ Mention an agent
          </button>
        </div>

        <div>
          <div className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-3">Recent Activity</div>
          <div className="space-y-2 text-xs text-slate-500">
            <p>—</p>
          </div>
        </div>
      </div>
    </div>
  );
}
