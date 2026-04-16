
import { type NextRequest, NextResponse } from "next/server"

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  // Skip auth middleware for API routes, static files, and auth pages
  if (
    pathname.startsWith("/api/") ||
    pathname.startsWith("/_next/") ||
    pathname === "/"
  ) {
    return NextResponse.next()

  }

  // Check for session token for protected routes
  // const token = request.cookies.get("mastodon_token")?.value

  // if (!token) {
  //   const homePage = new URL('/', request.url)
  //   return NextResponse.redirect(homePage)
  // }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
}
