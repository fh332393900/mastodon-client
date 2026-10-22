import type { Metadata } from "next"
import { SportsHub } from "@/components/sports/SportsHub"

export const metadata: Metadata = {
  title: "SportsPulse",
}

export default function SportsPage() {
  return (
    <div className="px-4 py-6">
      <SportsHub />
    </div>
  )
}
