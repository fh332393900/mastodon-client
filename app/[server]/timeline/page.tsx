"use client"

import { TimelineFeed } from "@/components/timeline/timeline-feed"
import { useTranslations } from "next-intl"

export default function TimelinePage() {
  const t = useTranslations()

  return (
    <div className="space-y-6 px-4 py-6">
      <div className="border-b border-border pb-4">
        <h1 className="text-2xl font-bold">{t("timeline.publicTimeline")}</h1>
        <p className="text-muted-foreground">{t("timeline.discover")}</p>
      </div>

      <TimelineFeed />
    </div>
  )
}
