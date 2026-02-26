// Simple task manager using JSON file
import fs from 'fs';
import path from 'path';

const TASKS_FILE = path.join(process.env.HOME || '/Users/anush', 'Mantaga/agent-framework/SHARED/tasks/tasks.json');

function readTasks() {
  try {
    const data = fs.readFileSync(TASKS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

function writeTasks(tasks: any[]) {
  fs.writeFileSync(TASKS_FILE, JSON.stringify(tasks, null, 2));
}

export function createTask(task: { title: string; description?: string; priority?: string; assigned_to?: string; created_by?: string }) {
  const tasks = readTasks();
  const newTask = {
    id: Date.now().toString(),
    ...task,
    status: 'pending',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  tasks.unshift(newTask);
  writeTasks(tasks);
  return newTask;
}

export function getTasks() {
  return readTasks();
}

export function updateTaskStatus(taskId: string, status: string, assigned_to?: string) {
  const tasks = readTasks();
  const task = tasks.find((t: any) => t.id === taskId);
  if (task) {
    task.status = status;
    task.updated_at = new Date().toISOString();
    if (assigned_to) task.assigned_to = assigned_to;
    writeTasks(tasks);
  }
  return task;
}

export function getPendingTasks() {
  return readTasks().filter((t: any) => t.status === 'pending');
}
