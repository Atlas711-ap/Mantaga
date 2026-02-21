import { NextResponse } from "next/server"

export function middleware(request: any) {
  const isLoggedIn = request.cookies.get("next-auth.session-token") || request.cookies.get("__Secure-next-auth.session-token")
  const isOnSignInPage = request.nextUrl.pathname.startsWith("/auth/signin")
  const isApiAuthRoute = request.nextUrl.pathname.startsWith("/api/auth")

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
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}
