export const runtime = 'nodejs'

import { cookies } from "next/headers"
import { type NextRequest, NextResponse } from "next/server"

const RESPONSE_HEADERS = {
  "Cache-Control": "private, no-cache, max-age=0, must-revalidate",
}

export async function POST(
  request: NextRequest
) {
  const cookieStore = await cookies()
  cookieStore.delete("mastodon_server")
  cookieStore.delete("mastodon_token")

  return NextResponse.json({ success: true }, { headers: RESPONSE_HEADERS })
}