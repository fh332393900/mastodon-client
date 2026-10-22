export const runtime = "nodejs"
export const revalidate = 1800

import "@/lib/proxy-agent"
import { NextResponse } from "next/server"
import { fetchSportsNews } from "@/lib/sports/news"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const sport = searchParams.get("sport") ?? "football"

  const news = await fetchSportsNews(sport)
  return NextResponse.json({ news })
}
