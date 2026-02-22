import { NextRequest, NextResponse } from "next/server"
import { ConvexHttpClient } from "convex/browser"
import bcrypt from "bcryptjs"

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!)

export async function POST() {
  try {
    // Check if admin exists
    const existingAdmin = await convex.query("getUserByEmail", { email: "admin@mantaga.ae" })

    if (existingAdmin) {
      return NextResponse.json({ message: "Admin already exists", created: false })
    }

    // Create admin user
    const adminPassword = "Mantaga@S2025"
    const passwordHash = await bcrypt.hash(adminPassword, 10)

    const adminId = await convex.mutation("createUser", {
      email: "admin@mantaga.ae",
      name: "Admin",
      passwordHash,
      role: "admin",
    })

    return NextResponse.json({ message: "Admin user created", created: true, id: adminId })
  } catch (error) {
    console.error("Seed error:", error)
    return NextResponse.json({ error: "Failed to seed user" }, { status: 500 })
  }
}
