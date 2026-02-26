import { NextResponse } from "next/server"
import { getToken } from "next-auth/jwt"

export async function middleware(request: any) {
  // Use NextAuth's getToken to properly check JWT session
  const token = await getToken({ 
    req: request, 
    secret: process.env.NEXTAUTH_SECRET 
  })
  
  const isLoggedIn = !!token
  const isOnSignInPage = request.nextUrl.pathname.startsWith("/auth/signin")
  const isApiAuthRoute = request.nextUrl.pathname.startsWith("/api/auth")
  const isSeedRoute = request.nextUrl.pathname === "/api/users/seed"
  const isAtlasRoute = request.nextUrl.pathname.startsWith("/api/atlas-parse")
  const isTaskRoute = request.nextUrl.pathname.startsWith("/api/tasks")
  const isLpoRoute = request.nextUrl.pathname.startsWith("/api/lpos")

  // Allow seed route (public - for creating first user)
  if (isSeedRoute) {
    return NextResponse.next()
  }

  // Allow Atlas parse route (public - called from upload page)
  if (isAtlasRoute) {
    return NextResponse.next()
  }

  // Allow Task API routes (public - for Athena integration)
  if (isTaskRoute) {
    return NextResponse.next()
  }

  // Allow LPO API routes (public - for reporting)
  if (isLpoRoute) {
    return NextResponse.next()
  }

  // Allow API auth routes
  if (isApiAuthRoute) {
    return NextResponse.next()
  }

  // Redirect to sign-in if not logged in
  if (!isLoggedIn && !isOnSignInPage) {
    return NextResponse.redirect(new URL("/auth/signin", request.url))
  }

  // Redirect to home if logged in and on sign-in page
  if (isLoggedIn && isOnSignInPage) {
    return NextResponse.redirect(new URL("/", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|public/).*)"],
}
