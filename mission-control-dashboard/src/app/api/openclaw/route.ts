import { NextRequest, NextResponse } from "next/server";
import { spawn } from "child_process";

// Map agent IDs to OpenClaw session keys
const AGENT_SESSIONS: Record<string, string> = {
  athena: "agent:main:main",
  nexus: "agent:nexus:main",
  atlas: "agent:atlas:main",
  forge: "agent:forge:main",
  neo: "agent:neo:main",
  zeus: "agent:zeus:main",
  faith: "agent:faith:main",
  alexis: "agent:alexis:main",
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { agentId, message } = body;

    if (!agentId || !message) {
      return NextResponse.json(
        { error: "Missing agentId or message" },
        { status: 400 }
      );
    }

    const sessionKey = AGENT_SESSIONS[agentId];
    if (!sessionKey) {
      return NextResponse.json(
        { error: `Unknown agent: ${agentId}` },
        { status: 400 }
      );
    }

    // Send message to OpenClaw session
    const response = await sendToOpenClaw(sessionKey, message);
    
    return NextResponse.json({ response });
  } catch (error: any) {
    console.error("Agent communication error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

function sendToOpenClaw(sessionKey: string, message: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const openclawPath = "/Users/anush/.nvm/versions/node/v22.22.0/bin/openclaw";
    
    // Use sessions send command
    const process = spawn(openclawPath, ["sessions", "send", "--session", sessionKey, "--message", message], {
      timeout: 60000,
    });

    let stdout = "";
    let stderr = "";

    process.stdout.on("data", (data) => {
      stdout += data.toString();
    });

    process.stderr.on("data", (data) => {
      stderr += data.toString();
    });

    process.on("close", (code) => {
      if (code === 0) {
        // Parse response - extract the AI's reply
        const lines = stdout.split("\n");
        // Find the actual response (skip command output)
        const response = lines.filter(l => l.trim() && !l.startsWith("Session") && !l.startsWith("→")).join("\n").trim();
        resolve(response || "Message sent to agent");
      } else {
        reject(new Error(stderr || `Exit code: ${code}`));
      }
    });

    process.on("error", (err) => {
      reject(err);
    });
  });
}
