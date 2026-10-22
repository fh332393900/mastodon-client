export const runtime = "nodejs"
export const revalidate = 300

import "@/lib/proxy-agent"
import { NextResponse } from "next/server"
import {
  fetchFootballFixtures,
  fetchFootballStandings,
} from "@/lib/football-data"
import { FOOTBALL_LEAGUES } from "@/lib/sports/config"

const VALID_LEAGUES = new Set(FOOTBALL_LEAGUES.map((league) => league.code))

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const league = searchParams.get("league") ?? "PL"
  const type = searchParams.get("type") ?? "fixtures"

  if (!VALID_LEAGUES.has(league)) {
    return NextResponse.json({ error: "unknown league" }, { status: 400 })
  }

  if (type === "standings") {
    const standings = await fetchFootballStandings(league)
    return NextResponse.json({ standings })
  }

  const fixtures = await fetchFootballFixtures(league)
  return NextResponse.json({ fixtures })
}
