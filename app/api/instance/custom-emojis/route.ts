import { NextResponse } from "next/server"
import { getMastodonClient } from "@/app/api/_lib/mastodon"

export async function GET() {
  try {
    const client = await getMastodonClient()
    if (!client) {
      return NextResponse.json([], { status: 200 })
    }

    const emojis = await client.v1.customEmojis.list()
    return NextResponse.json(emojis)
  } catch {
    return NextResponse.json([], { status: 200 })
  }
}
