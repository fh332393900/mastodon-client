export const runtime = 'nodejs'

import { NextResponse } from "next/server"
import { getMastodonClient } from "@/app/api/_lib/mastodon"

const RESPONSE_HEADERS = {
  "Cache-Control": "private, no-cache, max-age=0, must-revalidate",
}

export async function GET() {
  try {
    const client = await getMastodonClient()

    if (!client) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401, headers: RESPONSE_HEADERS },
      )
    }

    const account = await client.v1.accounts.verifyCredentials()
    return NextResponse.json(account, { headers: RESPONSE_HEADERS })
  } catch (error) {
    console.error("Verify credentials error:", error)
    return NextResponse.json(
      { error: "Failed to fetch current user" },
      { status: 500, headers: RESPONSE_HEADERS },
    )
  }
}
