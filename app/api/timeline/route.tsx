export const runtime = 'nodejs'

import { type NextRequest, NextResponse } from "next/server"
import { createRestAPIClient } from "masto"
import { cookies } from "next/headers"

const RESPONSE_HEADERS = {
  "Cache-Control": "private, no-cache, max-age=0, must-revalidate",
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type") || "public"
    const limit = Number.parseInt(searchParams.get("limit") || "20")

    const cookieStore = cookies()
    const token = (await cookieStore).get("mastodon_token")?.value
    const serverUrl = (await cookieStore).get("mastodon_server")?.value

    if (!token || !serverUrl) {
      return NextResponse.json(getMockTimeline(), { headers: RESPONSE_HEADERS })
    }

    const client = createRestAPIClient({
      url: `https://${serverUrl}`,
      accessToken: token,
    })

    let timeline
    switch (type) {
      case "home":
        timeline = await client.v1.timelines.home.list({ limit })
        break
      case "local":
        timeline = await client.v1.timelines.public.list({ local: true, limit })
        break
      default:
        timeline = await client.v1.timelines.public.list({ limit })
    }

    return NextResponse.json(timeline, { headers: RESPONSE_HEADERS })
  } catch (error) {
    console.error("Timeline fetch error:", error)
    return NextResponse.json(getMockTimeline(), { headers: RESPONSE_HEADERS })
  }
}

function getMockTimeline() {
  return [
    {
      id: "1",
      content: "<p>Welcome to the fediverse! 🌟 This is a sample post to show how beautiful our timeline looks.</p>",
      account: {
        id: "1",
        username: "demo_user",
        displayName: "Demo User",
        avatar: "/diverse-user-avatars.png",
      },
      createdAt: new Date().toISOString(),
      favouritesCount: 12,
      reblogsCount: 3,
      repliesCount: 5,
      favourited: false,
      reblogged: false,
    },
    {
      id: "2",
      content: "<p>Just discovered this amazing Mastodon client! The dark theme is absolutely gorgeous 🎨</p>",
      account: {
        id: "2",
        username: "designer_jane",
        displayName: "Jane Designer",
        avatar: "/diverse-woman-avatar.png",
      },
      createdAt: new Date(Date.now() - 3600000).toISOString(),
      favouritesCount: 8,
      reblogsCount: 2,
      repliesCount: 1,
      favourited: true,
      reblogged: false,
    },
  ]
}
