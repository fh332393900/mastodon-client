import { type NextRequest, NextResponse } from "next/server"
import { createRestAPIClient } from "masto"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get("code")
    const clientId = searchParams.get("client_id")
    const clientSecret = searchParams.get("client_secret")
    const serverUrl = searchParams.get("server_url")

    if (!code || !clientId || !clientSecret || !serverUrl) {
      return NextResponse.redirect("/login?error=missing_params")
    }

    const client = createRestAPIClient({ url: serverUrl })

    const token = await client.v1.oauth.token.create({
      clientId,
      clientSecret,
      redirectUri: `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/api/auth/mastodon/callback`,
      grantType: "authorization_code",
      code,
      scope: "read write follow push",
    })

    const response = NextResponse.redirect("/timeline")
    response.cookies.set("mastodon_token", token.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 30, // 30 days
    })
    response.cookies.set("mastodon_server", serverUrl, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 30, // 30 days
    })

    return response
  } catch (error) {
    console.error("OAuth callback error:", error)
    return NextResponse.redirect("/login?error=oauth_failed")
  }
}
