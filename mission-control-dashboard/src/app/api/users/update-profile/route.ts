import { NextRequest, NextResponse } from "next/server"
import { ConvexHttpClient } from "convex/browser"

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!)

export async function POST(request: NextRequest) {
  try {
    const { userId, name, email } = await request.json()

    if (!userId || !name || !email) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Update user in Convex
    // Convert string ID to convex ID
    const { DocId } = await import("convex/values")
    const convexUserId: any = DocId("users", userId)

    await convex.mutation("updateUserProfile", {
      userId: convexUserId,
      name,
      email,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Update profile error:", error)
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 })
  }
}
