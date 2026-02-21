import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        const adminUser = "Admin"
        const adminPass = "Mantaga@S2025"
        
        const inputUser = credentials?.username?.trim()
        const inputPass = credentials?.password?.trim()
        
        if (inputUser === adminUser && inputPass === adminPass) {
          return {
            id: "1",
            name: "Admin",
            email: "admin@mantaga.ae"
          }
        }
        return null
      }
    })
  ],
  pages: {
    signIn: "/auth/signin",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
})

export { handler as GET, handler as POST }
