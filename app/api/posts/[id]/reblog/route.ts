export const runtime = 'nodejs'

import { type NextRequest, NextResponse } from "next/server"
import { createRestAPIClient } from "masto"
import { cookies } from "next/headers"

const RESPONSE_HEADERS = {
  "Cache-Control": "private, no-cache, max-age=0, must-revalidate",
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const cookieStore = await cookies()
    const { id } = await params
    const token = cookieStore.get("mastodon_token")?.value
    const serverUrl = cookieStore.get("mastodon_server")?.value

    if (!token || !serverUrl) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401, headers: RESPONSE_HEADERS },
      )
    }

    const client = createRestAPIClient({
      url: serverUrl,
      accessToken: token,
    })

    const status = await client.v1.statuses.$select(id).reblog()
    return NextResponse.json(status, { headers: RESPONSE_HEADERS })
  } catch (error) {
    console.error("Reblog error:", error)
    return NextResponse.json(
      { error: "Failed to reblog post" },
      { status: 500, headers: RESPONSE_HEADERS },
    )
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const cookieStore = await cookies()
    const { id } = await params
    const token = cookieStore.get("mastodon_token")?.value
    const serverUrl = cookieStore.get("mastodon_server")?.value

    if (!token || !serverUrl) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401, headers: RESPONSE_HEADERS },
      )
    }

    const client = createRestAPIClient({
      url: serverUrl,
      accessToken: token,
    })

    const status = await client.v1.statuses.$select(id).unreblog()
    return NextResponse.json(status, { headers: RESPONSE_HEADERS })
  } catch (error) {
    console.error("Unreblog error:", error)
    return NextResponse.json(
      { error: "Failed to unreblog post" },
      { status: 500, headers: RESPONSE_HEADERS },
    )
  }
}
