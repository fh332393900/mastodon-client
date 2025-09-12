"use client"

import { ThreeColumnLayout } from "@/components/layout/three-column-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Heart } from "lucide-react"
import { motion } from "framer-motion"

export default function FavoritesPage() {
  return (
    <ThreeColumnLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="space-y-6"
      >
        <div className="flex items-center space-x-3 border-b border-border pb-4">
          <Heart className="w-8 h-8 text-red-500" />
          <h1 className="text-3xl font-bold">Favorites</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Your Favorite Posts</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Your favorite posts will appear here once you start liking content.</p>
          </CardContent>
        </Card>
      </motion.div>
    </ThreeColumnLayout>
  )
}
