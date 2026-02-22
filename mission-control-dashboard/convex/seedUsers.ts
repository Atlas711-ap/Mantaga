import { createAdminClient } from convex/server"
import bcrypt from "bcryptjs"

export async function seedUsers() {
  const convex = createAdminClient()
  
  const adminPassword = "Mantaga@S2025"
  const passwordHash = await bcrypt.hash(adminPassword, 10)
  
  // Check if admin exists
  const existingAdmin = await convex
    .query("users", { table: "users", index: "by_email", email: "admin@mantaga.ae" })
    .first()
  
  if (existingAdmin) {
    console.log("Admin user already exists")
    return
  }
  
  // Create admin user
  const id = await convex.insert("users", {
    email: "admin@mantaga.ae",
    name: "Admin",
    passwordHash,
    role: "admin",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  })
  
  console.log("Admin user created with ID:", id)
}

// Run if called directly
seedUsers().catch(console.error)
