"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { clsx } from "clsx";
import { ChevronLeft, ChevronRight, Clock, User, Repeat } from "lucide-react";

const eventTypes = [
  { id: "csv", color: "bg-emerald-500", label: "CSV Processing" },
  { id: "compliance", color: "bg-orange-500", label: "Compliance" },
  { id: "analysis", color: "bg-blue-500", label: "Analysis" },
  { id: "meeting", color: "bg-purple-500", label: "Meeting" },
];

const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 1, 19)); // Feb 2026
  const events = useQuery(api.seed.getCalendarEvents);

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();

    const days = [];
    for (let i = 0; i < startingDay; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }
    return days;
  };

  const getEventsForDay = (day: number | null) => {
    if (!day || !events) return [];
    const dateStr = `2026-02-${day.toString().padStart(2, "0")}`;
    return events.filter((e) => e.date === dateStr);
  };

  const getEventTypeColor = (type: string) => {
    return eventTypes.find((t) => t.id === type)?.color || "bg-slate-500";
  };

  const days = getDaysInMonth(currentDate);
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Calendar</h1>
          <p className="text-slate-400 mt-1">Scheduled operations and events</p>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))}
            className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-slate-400" />
          </button>
          <span className="text-lg font-medium text-white">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </span>
          <button
            onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))}
            className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <ChevronRight className="w-5 h-5 text-slate-400" />
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex gap-4">
        {eventTypes.map((type) => (
          <div key={type.id} className="flex items-center gap-2">
            <div className={clsx("w-3 h-3 rounded-full", type.color)} />
            <span className="text-xs text-slate-400">{type.label}</span>
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="grid grid-cols-7 border-b border-slate-800">
          {daysOfWeek.map((day) => (
            <div
              key={day}
              className="p-4 text-center text-sm font-medium text-slate-400 bg-slate-800/50"
            >
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7">
          {days.map((day, index) => {
            const dayEvents = getEventsForDay(day);
            const isToday = day === 19;
            return (
              <div
                key={index}
                className={clsx(
                  "min-h-[120px] p-2 border-b border-r border-slate-800",
                  day === null && "bg-slate-900/50"
                )}
              >
                {day && (
                  <>
                    <div
                      className={clsx(
                        "text-sm font-medium mb-2",
                        isToday ? "text-blue-400" : "text-slate-400"
                      )}
                    >
                      {day}
                    </div>
                    <div className="space-y-1">
                      {dayEvents.slice(0, 2).map((event, idx) => (
                        <div
                          key={idx}
                          className={clsx(
                            "text-xs px-2 py-1 rounded truncate text-white",
                            getEventTypeColor(event.type)
                          )}
                        >
                          {event.time} {event.title}
                        </div>
                      ))}
                      {dayEvents.length > 2 && (
                        <div className="text-xs text-slate-500">
                          +{dayEvents.length - 2} more
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Today's Schedule */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Today's Schedule - Feb 19, 2026</h2>
        <div className="space-y-3">
          {events
            ?.filter((e) => e.date === "2026-02-19")
            .sort((a, b) => a.time.localeCompare(b.time))
            .map((event) => (
              <div
                key={event._id}
                className="flex items-center gap-4 bg-slate-800/50 border border-slate-700 rounded-lg p-4"
              >
                <div className={clsx("w-1 h-12 rounded-full", getEventTypeColor(event.type))} />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-white">{event.title}</span>
                    {event.recurring && (
                      <Repeat className="w-4 h-4 text-slate-500" />
                    )}
                  </div>
                  <p className="text-sm text-slate-400">{event.description}</p>
                </div>
                <div className="flex items-center gap-4 text-sm text-slate-400">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{event.time}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <User className="w-4 h-4" />
                    <span>{event.agent}</span>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
