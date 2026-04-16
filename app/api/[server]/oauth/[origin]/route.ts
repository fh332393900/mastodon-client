import { getApp, getRedirectURI } from "@/lib/shared"
import { type NextRequest, NextResponse } from "next/server"
import fetch from 'node-fetch'
import { agent } from '@/lib/proxy-agent'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ server: string, origin: string }> }
) {
  const searchParams = request.nextUrl.searchParams
  let { server, origin } = await params
  server = server.toLocaleLowerCase().trim()
  origin = decodeURIComponent(origin)
  const app = await getApp(origin, server)

  if (!app) {
    return new Response(`App not registered for server: ${server}`, {
      status: 400,
    })
  }

  const code = searchParams.get('code')
  if (!code) {
    return NextResponse.json({ error: "Missing authentication code." }, { status: 400 })
  }

  try {
    const form = new URLSearchParams();
    form.append('grant_type', 'authorization_code');
    form.append('code', code);
    form.append('client_id', app.client_id);
    form.append('client_secret', app.client_secret);
    form.append('redirect_uri',  getRedirectURI(origin, server));
    form.append('scope', 'read write follow push');
    const result = await fetch(`https://${server}/oauth/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: form.toString(),
      agent: agent as any
    })

    const token = await result.json() as any
    const response = NextResponse.redirect(new URL("/timeline", request.url))
    response.cookies.set("mastodon_token", token.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 30, // 30 days
    })
    response.cookies.set("mastodon_server", server, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 30, // 30 days
    })
    return response
  } catch (error) {
    console.error("OAuth callback error:", error)
    return NextResponse.redirect("/?error=oauth_failed") 
  }
}