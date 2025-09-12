import { type NextRequest, NextResponse } from "next/server"
import { createRestAPIClient } from "masto"

export async function POST(request: NextRequest) {
  try {
    const { serverUrl } = await request.json()

    if (!serverUrl) {
      return NextResponse.json({ error: "Server URL is required" }, { status: 400 })
    }

    const client = createRestAPIClient({ url: serverUrl })

    const app = await client.v1.apps.create({
      clientName: "MastoClient",
      redirectUris: `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/api/auth/mastodon/callback`,
      scopes: "read write follow push",
      website: process.env.NEXTAUTH_URL || "http://localhost:3000",
    })

    const authUrl = `${serverUrl}/oauth/authorize?client_id=${app.clientId}&redirect_uri=${encodeURIComponent(app.redirectUri)}&response_type=code&scope=read+write+follow+push`

    return NextResponse.json({
      authUrl,
      clientId: app.clientId,
      clientSecret: app.clientSecret,
      serverUrl,
    })
  } catch (error) {
    console.error("Mastodon OAuth error:", error)
    return NextResponse.json({ error: "Failed to initialize OAuth" }, { status: 500 })
  }
}
