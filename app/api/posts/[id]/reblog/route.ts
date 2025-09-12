import { type NextRequest, NextResponse } from "next/server"
import { createRestAPIClient } from "masto"
import { cookies } from "next/headers"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const cookieStore = cookies()
    const token = cookieStore.get("mastodon_token")?.value
    const serverUrl = cookieStore.get("mastodon_server")?.value

    if (!token || !serverUrl) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const client = createRestAPIClient({
      url: serverUrl,
      accessToken: token,
    })

    const status = await client.v1.statuses.$select(params.id).reblog()
    return NextResponse.json(status)
  } catch (error) {
    console.error("Reblog error:", error)
    return NextResponse.json({ error: "Failed to reblog post" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const cookieStore = cookies()
    const token = cookieStore.get("mastodon_token")?.value
    const serverUrl = cookieStore.get("mastodon_server")?.value

    if (!token || !serverUrl) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const client = createRestAPIClient({
      url: serverUrl,
      accessToken: token,
    })

    const status = await client.v1.statuses.$select(params.id).unreblog()
    return NextResponse.json(status)
  } catch (error) {
    console.error("Unreblog error:", error)
    return NextResponse.json({ error: "Failed to unreblog post" }, { status: 500 })
  }
}
