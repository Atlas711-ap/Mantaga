import { NextRequest, NextResponse } from "next/server"
import { ConvexHttpClient } from "convex/browser"

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!)

export async function POST(request: NextRequest) {
  try {
    const { userId, name, email } = await request.json()

    if (!userId || !name || !email) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (convex.mutation as any)("updateUserProfile", {
      userId,
      name,
      email,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Update profile error:", error)
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 })
  }
}
