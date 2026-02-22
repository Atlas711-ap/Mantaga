import { NextRequest, NextResponse } from "next/server"
import { ConvexHttpClient } from "convex/browser"

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!)

export async function POST(request: NextRequest) {
  try {
    const { userId, newPasswordHash } = await request.json()

    if (!userId || !newPasswordHash) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (convex.mutation as any)("updateUserPassword", {
      userId,
      passwordHash: newPasswordHash,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Change password error:", error)
    return NextResponse.json({ error: "Failed to change password" }, { status: 500 })
  }
}
