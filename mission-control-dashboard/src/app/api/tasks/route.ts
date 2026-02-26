import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";

// In-memory task store for demo (resets on server restart)
// For production, integrate with Convex or database
const tasks: Map<string, any> = new Map();

// Pre-populate with demo tasks
const demoTasks = [
  {
    id: uuidv4(),
    title: 'Follow up with Quadrant',
    description: 'Check on pending orders and delivery status',
    status: 'in_progress',
    priority: 'high',
    assigned_to: 'nexus',
    created_by: 'Anush',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: uuidv4(),
    title: 'Review Amazon sales report',
    description: 'Analyze last week performance',
    status: 'pending',
    priority: 'medium',
    assigned_to: 'atlas',
    created_by: 'Athena',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

// Initialize demo tasks
demoTasks.forEach(t => tasks.set(t.id, t));

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description, priority, assigned_to, created_by, tags, due_date } = body;

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    const task = {
      id: uuidv4(),
      title,
      description: description || "",
      status: "pending",
      priority: priority || "medium",
      assigned_to: assigned_to || null,
      created_by: created_by || "Athena",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      due_date: due_date || null,
      tags: tags || [],
    };

    tasks.set(task.id, task);

    return NextResponse.json({ success: true, task });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET() {
  const allTasks = Array.from(tasks.values()).sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
  return NextResponse.json({ tasks: allTasks });
}
