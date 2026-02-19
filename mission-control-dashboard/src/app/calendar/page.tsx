export default function CalendarPage() {
  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="space-y-6">
      {/* Calendar Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button className="p-2 hover:bg-slate-800 rounded-lg text-slate-400">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h2 className="text-xl font-semibold text-white">February 2026</h2>
          <button className="p-2 hover:bg-slate-800 rounded-lg text-slate-400">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
        <button className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-sm font-medium">
          Add Event
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
        <div className="grid grid-cols-7 gap-2 mb-2">
          {weekDays.map((day) => (
            <div key={day} className="text-center text-xs font-medium text-slate-400 uppercase py-2">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-2">
          {/* Empty cells for offset */}
          <div className="aspect-square"></div>
          <div className="aspect-square"></div>
          {days.slice(0, 28).map((day) => (
            <div
              key={day}
              className="aspect-square bg-slate-800 hover:bg-slate-700 rounded-lg p-2 text-sm text-slate-300 cursor-pointer"
            >
              {day}
            </div>
          ))}
        </div>
      </div>

      {/* Empty State */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center">
        <p className="text-sm text-slate-500">Add an event to notify all agents</p>
      </div>
    </div>
  );
}
