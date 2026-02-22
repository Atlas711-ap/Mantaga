import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        // TEMPORARY: Allow login with sales@mantaga.com / Mantaga@S2025
        // Remove after user is created in DB
        if (credentials.email === "sales@mantaga.com" && credentials.password === "Mantaga@S2025") {
          return {
            id: "temp-sales",
            name: "Sales",
            email: "sales@mantaga.com",
            role: "admin"
          }
        }

        try {
          // Call our verification API
          const response = await fetch(`${process.env.NEXT_PUBLIC_CONVEX_URL}/api/users/verify`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password
            }),
          })

          if (!response.ok) {
            const errorData = await response.json()
            console.log("Verification error:", errorData)
            return null
          }

          const user = await response.json()

          return {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role
          }
        } catch (error) {
          console.error("Auth error:", error)
          return null
        }
      }
    })
  ],
  pages: {
    signIn: "/auth/signin",
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }: any) {
      if (user) {
        token.role = user.role
        token.id = user.id
      }
      return token
    },
    async session({ session, token }: any) {
      if (session.user) {
        session.user.role = token.role
        session.user.id = token.id
      }
      return session
    }
  },
  secret: process.env.NEXTAUTH_SECRET,
})

export { handler as GET, handler as POST }
