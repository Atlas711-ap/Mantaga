"use client";

export const dynamic = 'force-dynamic';

import { useState } from "react";
import { useCalendarEvents, useInsertCalendarEvent, useDeleteCalendarEvent } from "../../hooks/useConvex";

export default function CalendarPage() {
  const events = useCalendarEvents();
  const insertEvent = useInsertCalendarEvent();
  const deleteEvent = useDeleteCalendarEvent();
  
  const [currentDate, setCurrentDate] = useState(new Date(2026, 1, 1)); // February 2026
  const [showAddModal, setShowAddModal] = useState(false);
  const [newEventTitle, setNewEventTitle] = useState("");
  const [newEventDate, setNewEventDate] = useState("");

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const getEventsForDay = (day: number) => {
    if (!events) return [];
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return events.filter(e => e.event_date === dateStr);
  };

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleAddEvent = async () => {
    if (!newEventTitle.trim() || !newEventDate) return;
    
    try {
      await insertEvent({
        title: newEventTitle,
        event_date: newEventDate,
        created_by: "Anush",
      });
      setNewEventTitle("");
      setNewEventDate("");
      setShowAddModal(false);
    } catch (error) {
      console.error("Failed to add event:", error);
    }
  };

  const handleDeleteEvent = async (id: any) => {
    try {
      await deleteEvent({ id });
    } catch (error) {
      console.error("Failed to delete event:", error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Calendar Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={prevMonth} className="p-2 hover:bg-slate-800 rounded-lg text-slate-400">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h2 className="text-xl font-semibold text-white">{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</h2>
          <button onClick={nextMonth} className="p-2 hover:bg-slate-800 rounded-lg text-slate-400">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-sm font-medium"
        >
          Add Event
        </button>
      </div>

      {/* Add Event Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 w-96">
            <h3 className="text-lg font-semibold text-white mb-4">Add Calendar Event</h3>
            <input
              type="text"
              placeholder="Event title"
              value={newEventTitle}
              onChange={(e) => setNewEventTitle(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white mb-3"
            />
            <input
              type="date"
              value={newEventDate}
              onChange={(e) => setNewEventDate(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white mb-4"
            />
            <div className="flex gap-2">
              <button
                onClick={handleAddEvent}
                className="flex-1 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg"
              >
                Add Event
              </button>
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

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
          {Array.from({ length: firstDayOfMonth }).map((_, i) => (
            <div key={`empty-${i}`} className="aspect-square"></div>
          ))}
          {days.map((day) => {
            const dayEvents = getEventsForDay(day);
            return (
              <div
                key={day}
                className="aspect-square bg-slate-800 hover:bg-slate-700 rounded-lg p-2 text-sm text-slate-300 cursor-pointer relative"
              >
                {day}
                {dayEvents.length > 0 && (
                  <div className="absolute bottom-1 left-1 right-1 flex flex-wrap gap-0.5">
                    {dayEvents.slice(0, 3).map((e) => (
                      <div key={e._id} className="h-1 flex-1 bg-amber-500 rounded-full" />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Events List */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
        <div className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-3">Events This Month</div>
        {events && events.length > 0 ? (
          <div className="space-y-2">
            {events.map((event) => (
              <div key={event._id} className="flex items-center justify-between p-3 bg-slate-800 rounded-lg">
                <div>
                  <div className="text-sm text-white">{event.title}</div>
                  <div className="text-xs text-slate-400">{event.event_date} • {event.created_by}</div>
                </div>
                <button
                  onClick={() => handleDeleteEvent(event._id)}
                  className="text-slate-400 hover:text-red-400"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-500">No events — add one to notify all agents</p>
        )}
      </div>
    </div>
  );
}
