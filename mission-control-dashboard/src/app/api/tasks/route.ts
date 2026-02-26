import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";

const API_KEY = process.env.TASK_API_KEY || "mantaga-secret-key";

// In-memory task store (shared across requests in development)
// In production, this would connect to Convex or a database
const tasks = new Map();

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
