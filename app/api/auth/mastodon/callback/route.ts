import { type NextRequest, NextResponse } from "next/server"
import { createRestAPIClient } from "masto"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get("code")
    const clientId = process.env.CLIENT_ID
    const clientSecret = process.env.CLIIENT_SECRET
    const serverUrl = 'https://mastodon.social'

    if (!code) {
      return NextResponse.redirect("/login?error=missing_params")
    }

    // const client = createRestAPIClient({ url: serverUrl })

    const params = new URLSearchParams();
    params.append('grant_type', 'authorization_code');
    params.append('code', code);
    params.append('client_id', clientId!);
    params.append('client_secret', clientSecret!);
    params.append('redirect_uri',  `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/api/auth/mastodon/callback`);
    params.append('scope', 'read write follow');
    console.log(params, 'params====')
    const res: any = await fetch(`${serverUrl}/oauth/token`, {
      method: 'POST',
      body: params
    })
    console.log(res, 'res---')
    const token = await res.json();
    console.log(token, 'token')
    const response = NextResponse.redirect(new URL("/timeline"))
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
