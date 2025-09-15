import { type NextRequest, NextResponse } from "next/server"
import { createRestAPIClient } from "masto"
import { cookies } from "next/headers"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const cookieStore = cookies()
    const token = (await cookieStore).get("mastodon_token")?.value
    const serverUrl = (await cookieStore).get("mastodon_server")?.value

    if (!token || !serverUrl) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const client = createRestAPIClient({
      url: serverUrl,
      accessToken: token,
    })

    const status = await client.v1.statuses.$select(params.id).favourite()
    return NextResponse.json(status)
  } catch (error) {
    console.error("Favourite error:", error)
    return NextResponse.json({ error: "Failed to favourite post" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const cookieStore = cookies()
    const token = (await cookieStore).get("mastodon_token")?.value
    const serverUrl = (await cookieStore).get("mastodon_server")?.value

    if (!token || !serverUrl) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const client = createRestAPIClient({
      url: serverUrl,
      accessToken: token,
    })

    const status = await client.v1.statuses.$select(params.id).unfavourite()
    return NextResponse.json(status)
  } catch (error) {
    console.error("Unfavourite error:", error)
    return NextResponse.json({ error: "Failed to unfavourite post" }, { status: 500 })
  }
}
