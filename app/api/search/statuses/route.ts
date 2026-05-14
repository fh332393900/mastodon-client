export const runtime = 'nodejs'

import { NextResponse } from "next/server"
import { getMastodonAuth } from "@/app/api/_lib/mastodon"

const RESPONSE_HEADERS = {
  "Cache-Control": "private, no-cache, max-age=0, must-revalidate",
}

export async function GET(request: Request) {
  try {
    const auth = await getMastodonAuth()
    if (!auth) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401, headers: RESPONSE_HEADERS },
      )
    }

    const { searchParams } = new URL(request.url)
    const q = searchParams.get("q") ?? ""
    const limit = searchParams.get("limit") ?? "5"
    const resolve = searchParams.get("resolve") ?? "true"

    if (!q.trim()) {
      return NextResponse.json(
        { error: "Invalid search params" },
        { status: 400, headers: RESPONSE_HEADERS },
      )
    }

    // Mastodon v2 search supports searching statuses via type=statuses
    const url = new URL(`${auth.url}/api/v2/search`)
    url.searchParams.set("q", q)
    url.searchParams.set("type", "statuses")
    url.searchParams.set("limit", limit)
    url.searchParams.set("resolve", resolve)

    const response = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${auth.token}`,
        accept: "application/json",
      },
    })

    if (!response.ok) {
      const text = await response.text()
      return NextResponse.json(
        { error: text || "Search failed" },
        { status: response.status, headers: RESPONSE_HEADERS },
      )
    }

    const data = await response.json()
    return NextResponse.json(
      { statuses: data.statuses ?? [] },
      { headers: RESPONSE_HEADERS },
    )
  } catch (error) {
    console.error("Statuses search error:", error)
    return NextResponse.json(
      { error: "Search failed" },
      { status: 500, headers: RESPONSE_HEADERS },
    )
  }
}
