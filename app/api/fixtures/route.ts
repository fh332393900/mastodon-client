export const runtime = "nodejs"
export const revalidate = 300

import { NextResponse } from "next/server"
import { fetchPremierLeagueFixtures } from "@/lib/football-data"

export async function GET() {
  const fixtures = await fetchPremierLeagueFixtures()
  return NextResponse.json({ fixtures })
}
