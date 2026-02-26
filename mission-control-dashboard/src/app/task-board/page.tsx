'use client';

import { useState } from 'react';
import { useAllTasks, useCreateTask, useUpdateTaskStatus, useAssignTask } from '../../hooks/useConvex';
import { Id } from '../../../convex/_generated/dataModel';

type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';
type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

interface Task {
  _id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assigned_to?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  due_date?: string;
}

const AGENTS = ['nexus', 'atlas', 'forge', 'neo', 'zeus', 'faith', 'alexis', 'scout'];

export default function TaskBoardPage() {
  const [filter, setFilter] = useState<'all' | TaskStatus>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  // Real Convex data - using hooks
  const allTasks = useAllTasks() || [];
  const createTask = useCreateTask();
  const updateTaskStatus = useUpdateTaskStatus();
  const assignTask = useAssignTask();

  const filteredTasks = filter === 'all' 
    ? allTasks 
    : allTasks.filter((t: Task) => t.status === filter);

  const pendingTasks = allTasks.filter((t: Task) => t.status === 'pending');
  const inProgressTasks = allTasks.filter((t: Task) => t.status === 'in_progress');
  const completedTasks = allTasks.filter((t: Task) => t.status === 'completed');

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

  const handleStatusChange = async (taskId: string, status: TaskStatus) => {
    try {
      await updateTaskStatus({ taskId: taskId as any, status });
    } catch (error) {
      console.error('Failed to update task status:', error);
    }
  };

  const handleAssign = async (taskId: string, agent: string) => {
    try {
      await assignTask({ taskId: taskId as any, assigned_to: agent });
    } catch (error) {
      console.error('Failed to assign task:', error);
    }
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
          <div className="text-2xl font-bold">{allTasks.length}</div>
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
        {allTasks.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            No tasks found. Create one to get started.
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            No tasks with status "{filter}"
          </div>
        ) : (
          filteredTasks.map((task: Task) => (
            <div key={task._id} className="bg-slate-800 rounded-lg p-4 border border-slate-700">
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
                    {task.due_date && <span>Due: {task.due_date}</span>}
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  {!task.assigned_to && task.status === 'pending' && (
                    <select
                      onChange={(e) => handleAssign(task._id, e.target.value)}
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
                      onChange={(e) => handleStatusChange(task._id, e.target.value as TaskStatus)}
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
        <CreateTaskModal onClose={() => setShowCreateModal(false)} createTask={createTask} />
      )}
    </div>
  );
}

function CreateTaskModal({ onClose, createTask }: { onClose: () => void; createTask: any }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium' as TaskPriority,
    assigned_to: '',
    due_date: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      await createTask({
        title: formData.title,
        description: formData.description,
        priority: formData.priority,
        assigned_to: formData.assigned_to || undefined,
        created_by: 'Athena',
        due_date: formData.due_date || undefined,
      });
      onClose();
    } catch (error) {
      console.error('Failed to create task:', error);
    }
    
    setSubmitting(false);
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
          <div>
            <label className="block text-sm text-slate-400 mb-1">Due date</label>
            <input
              type="date"
              value={formData.due_date}
              onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
              className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2"
            />
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
              disabled={submitting}
              className="flex-1 py-2 bg-amber-500 hover:bg-amber-600 rounded disabled:opacity-50"
            >
              {submitting ? 'Creating...' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
