import { NextRequest, NextResponse } from "next/server"
import { ConvexHttpClient } from "convex/browser"
import bcrypt from "bcryptjs"

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!)

export async function POST() {
  try {
    const { email, name, password, role = "admin" } = { 
      email: "sales@mantaga.com",
      name: "Sales",
      password: "Mantaga@S2025",
      role: "admin"
    }

    // Check if user exists
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const existingUser: any = await (convex.query as any)("getUserByEmail", { email })

    if (existingUser) {
      return NextResponse.json({ message: "User already exists", created: false, email: existingUser.email })
    }

    // Create user
    const passwordHash = await bcrypt.hash(password, 10)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const userId = await (convex.mutation as any)("createUser", {
      email,
      name,
      passwordHash,
      role,
    })

    return NextResponse.json({ message: "User created", created: true, id: userId, email, role })
  } catch (error) {
    console.error("Seed error:", error)
    return NextResponse.json({ error: "Failed to create user", details: String(error) }, { status: 500 })
  }
}
