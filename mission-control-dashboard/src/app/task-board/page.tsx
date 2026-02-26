'use client';

import { useState, useEffect } from 'react';

type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';
type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assigned_to?: string;
  created_by: string;
  created_at: string;
}

const AGENTS = ['nexus', 'atlas', 'forge', 'neo', 'zeus', 'faith', 'alexis', 'scout'];

// Demo tasks for testing
const DEMO_TASKS: Task[] = [
  { id: '1', title: 'Test Task 1', description: 'This is a test task', status: 'pending', priority: 'medium', created_by: 'Athena', created_at: new Date().toISOString() },
  { id: '2', title: 'Follow up with Quadrant', description: 'Check on pending orders', status: 'in_progress', priority: 'high', assigned_to: 'nexus', created_by: 'Anush', created_at: new Date().toISOString() },
];

export default function TaskBoardPage() {
  const [filter, setFilter] = useState<'all' | TaskStatus>('all');
  const [tasks, setTasks] = useState<Task[]>(DEMO_TASKS);
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  const filteredTasks = filter === 'all' 
    ? tasks 
    : tasks.filter((t) => t.status === filter);

  const pendingTasks = tasks.filter((t) => t.status === 'pending');
  const inProgressTasks = tasks.filter((t) => t.status === 'in_progress');
  const completedTasks = tasks.filter((t) => t.status === 'completed');

  const getPriorityColor = (priority: TaskPriority) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
    }
  };

  const getStatusColor = (status: TaskStatus) => {
    switch (status) {
      case 'pending': return 'text-yellow-400';
      case 'in_progress': return 'text-blue-400';
      case 'completed': return 'text-green-400';
      case 'cancelled': return 'text-slate-400';
    }
  };

  const handleStatusChange = (taskId: string, status: TaskStatus) => {
    setTasks(tasks.map(t => t.id === taskId ? { ...t, status } : t));
  };

  const handleAssign = (taskId: string, agent: string) => {
    setTasks(tasks.map(t => t.id === taskId ? { ...t, assigned_to: agent } : t));
  };

  const handleCreateTask = (task: Omit<Task, 'id' | 'created_at'>) => {
    const newTask: Task = {
      ...task,
      id: Date.now().toString(),
      created_at: new Date().toISOString(),
    };
    setTasks([newTask, ...tasks]);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">📋 Task Board</h1>
          <p className="text-slate-400">Manage and track agent tasks</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-medium"
        >
          + Create Task
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-slate-800 rounded-lg p-4">
          <div className="text-2xl font-bold">{pendingTasks.length}</div>
          <div className="text-sm text-slate-400">Pending</div>
        </div>
        <div className="bg-slate-800 rounded-lg p-4">
          <div className="text-2xl font-bold text-blue-400">{inProgressTasks.length}</div>
          <div className="text-sm text-slate-400">In Progress</div>
        </div>
        <div className="bg-slate-800 rounded-lg p-4">
          <div className="text-2xl font-bold text-green-400">{completedTasks.length}</div>
          <div className="text-sm text-slate-400">Completed</div>
        </div>
        <div className="bg-slate-800 rounded-lg p-4">
          <div className="text-2xl font-bold">{tasks.length}</div>
          <div className="text-sm text-slate-400">Total</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {(['all', 'pending', 'in_progress', 'completed'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              filter === f 
                ? 'bg-amber-500 text-white' 
                : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
            }`}
          >
            {f === 'all' ? 'All' : f.replace('_', ' ').toUpperCase()}
          </button>
        ))}
      </div>

      {/* Task List */}
      <div className="space-y-3">
        {filteredTasks.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            No tasks found
          </div>
        ) : (
          filteredTasks.map((task) => (
            <div key={task.id} className="bg-slate-800 rounded-lg p-4 border border-slate-700">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`w-2 h-2 rounded-full ${getPriorityColor(task.priority)}`} />
                    <span className={`text-xs font-medium uppercase ${getStatusColor(task.status)}`}>
                      {task.status.replace('_', ' ')}
                    </span>
                    {task.assigned_to && (
                      <span className="text-xs bg-slate-700 px-2 py-0.5 rounded">
                        @{task.assigned_to}
                      </span>
                    )}
                  </div>
                  <h3 className="font-medium">{task.title}</h3>
                  <p className="text-sm text-slate-400 mt-1">{task.description}</p>
                  <div className="flex gap-4 mt-2 text-xs text-slate-500">
                    <span>By: {task.created_by}</span>
                    <span>{new Date(task.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  {!task.assigned_to && task.status === 'pending' && (
                    <select
                      onChange={(e) => handleAssign(task.id, e.target.value)}
                      className="bg-slate-700 text-sm rounded px-2 py-1"
                      defaultValue=""
                    >
                      <option value="" disabled>Assign to...</option>
                      {AGENTS.map((agent) => (
                        <option key={agent} value={agent}>@{agent}</option>
                      ))}
                    </select>
                  )}
                  {task.status !== 'completed' && (
                    <select
                      onChange={(e) => handleStatusChange(task.id, e.target.value as TaskStatus)}
                      className="bg-slate-700 text-sm rounded px-2 py-1"
                      value={task.status}
                    >
                      <option value="pending">Pending</option>
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <CreateTaskModal onClose={() => setShowCreateModal(false)} onCreate={handleCreateTask} />
      )}
    </div>
  );
}

function CreateTaskModal({ onClose, onCreate }: { onClose: () => void; onCreate: (task: Omit<Task, 'id' | 'created_at'>) => void }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium' as TaskPriority,
    assigned_to: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreate({
      title: formData.title,
      description: formData.description,
      priority: formData.priority,
      status: 'pending',
      assigned_to: formData.assigned_to || undefined,
      created_by: 'Athena',
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-slate-800 rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Create New Task</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-slate-400 mb-1">Title *</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2"
              placeholder="Task title"
            />
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 h-24"
              placeholder="Task description"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-slate-400 mb-1">Priority</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value as TaskPriority })}
                className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Assign to</label>
              <select
                value={formData.assigned_to}
                onChange={(e) => setFormData({ ...formData, assigned_to: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2"
              >
                <option value="">Unassigned</option>
                {AGENTS.map((agent) => (
                  <option key={agent} value={agent}>@{agent}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 bg-slate-700 hover:bg-slate-600 rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2 bg-amber-500 hover:bg-amber-600 rounded"
            >
              Create Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
