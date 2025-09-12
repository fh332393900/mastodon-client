"use client"

import { ThreeColumnLayout } from "@/components/layout/three-column-layout"
import { TimelineFeed } from "@/components/timeline/timeline-feed"
import { motion } from "framer-motion"

export default function TimelinePage() {
  return (
    <ThreeColumnLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="space-y-6"
      >
        <div className="border-b border-border pb-4">
          <h1 className="text-2xl font-bold">Public Timeline</h1>
          <p className="text-muted-foreground">Discover what's happening across the fediverse</p>
        </div>

        <TimelineFeed />
      </motion.div>
    </ThreeColumnLayout>
  )
}
