"use client"

import { ThreeColumnLayout } from "@/components/layout/three-column-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Search, TrendingUp, Users, Hash } from "lucide-react"
import { motion } from "framer-motion"

export default function ExplorePage() {
  const trendingTopics = [
    { tag: "fediverse", posts: 1234 },
    { tag: "mastodon", posts: 892 },
    { tag: "opensource", posts: 567 },
    { tag: "privacy", posts: 445 },
    { tag: "decentralized", posts: 334 },
  ]

  const suggestedUsers = [
    { name: "Mastodon", handle: "@mastodon@mastodon.social", followers: "500K" },
    { name: "Eugen Rochko", handle: "@gargron@mastodon.social", followers: "250K" },
    { name: "Fediverse News", handle: "@fediverse@social.vivaldi.net", followers: "45K" },
  ]

  return (
    <ThreeColumnLayout>
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center space-x-3 border-b border-border pb-4"
        >
          <Search className="w-8 h-8 text-green-500" />
          <h1 className="text-3xl font-bold">Explore</h1>
        </motion.div>

        {/* Search Bar */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card>
            <CardContent className="p-4">
              <div className="flex space-x-2">
                <Input placeholder="Search for posts, users, or hashtags..." className="flex-1" />
                <Button>
                  <Search className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Trending Topics */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5 text-accent" />
                  <span>Trending Topics</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {trendingTopics.map((topic, index) => (
                  <div
                    key={topic.tag}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center space-x-3">
                      <Hash className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium">#{topic.tag}</span>
                    </div>
                    <Badge variant="secondary">{topic.posts} posts</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>

          {/* Suggested Users */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="w-5 h-5 text-primary" />
                  <span>Suggested Users</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {suggestedUsers.map((user, index) => (
                  <div
                    key={user.handle}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div>
                      <p className="font-medium">{user.name}</p>
                      <p className="text-sm text-muted-foreground">{user.handle}</p>
                      <p className="text-xs text-muted-foreground">{user.followers} followers</p>
                    </div>
                    <Button size="sm" variant="outline">
                      Follow
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </ThreeColumnLayout>
  )
}
