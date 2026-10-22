export const runtime = "nodejs"
export const revalidate = 3600

import "@/lib/proxy-agent"
import { NextResponse } from "next/server"
import {
  fetchF1ConstructorStandings,
  fetchF1DriverStandings,
  fetchF1RaceResults,
  fetchF1Schedule,
} from "@/lib/sports/f1"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const type = searchParams.get("type") ?? "schedule"
  const roundParam = searchParams.get("round")
  const round = roundParam ? Number.parseInt(roundParam, 10) : undefined

  switch (type) {
    case "results": {
      const race = await fetchF1RaceResults(Number.isFinite(round) ? round : undefined)
      return NextResponse.json({ race })
    }
    case "drivers": {
      const standings = await fetchF1DriverStandings()
      return NextResponse.json({ standings })
    }
    case "teams": {
      const standings = await fetchF1ConstructorStandings()
      return NextResponse.json({ standings })
    }
    default: {
      const races = await fetchF1Schedule()
      return NextResponse.json({ races })
    }
  }
}
