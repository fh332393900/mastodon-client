import { NextResponse } from "next/server"
import { getMastodonAuth } from "@/app/api/_lib/mastodon"

export async function GET(request: Request) {
  try {
    const auth = await getMastodonAuth()
    if (!auth) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const q = searchParams.get("q") ?? ""
    const limit = searchParams.get("limit") ?? "5"
    const resolve = searchParams.get("resolve") ?? "true"

    if (!q.trim()) {
      return NextResponse.json({ error: "Invalid search params" }, { status: 400 })
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
      cache: "no-store",
    })

    if (!response.ok) {
      const text = await response.text()
      return NextResponse.json(
        { error: text || "Search failed" },
        { status: response.status },
      )
    }

    const data = await response.json()
    return NextResponse.json({ statuses: data.statuses ?? [] })
  } catch (error) {
    console.error("Statuses search error:", error)
    return NextResponse.json({ error: "Search failed" }, { status: 500 })
  }
}
