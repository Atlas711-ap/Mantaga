import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";

const API_KEY = process.env.TASK_API_KEY || "mantaga-secret-key";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description, priority, assigned_to, created_by, tags } = body;

    // Simple in-memory storage (for demo - should use Convex in production)
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
      tags: tags || [],
    };

    // In production, save to Convex. For now, return success.
    console.log("Task created:", task);

    return NextResponse.json({ success: true, task });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ message: "Task API working" });
}
