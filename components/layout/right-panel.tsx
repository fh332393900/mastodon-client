"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Search, Github, Shield, Info } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const trendingTags = [
  { tag: "#OpenSource", posts: "2.1k" },
  { tag: "#WebDev", posts: "1.8k" },
  { tag: "#Mastodon", posts: "1.2k" },
  { tag: "#Privacy", posts: "956" },
  { tag: "#Fediverse", posts: "743" },
]

export function RightPanel() {
  const [searchQuery, setSearchQuery] = useState("")

  return (
    <motion.aside
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
      className="hidden lg:flex w-80 flex-col bg-card/50 border-l border-border"
    >
      <div className="flex flex-col h-full p-4 space-y-4">
        {/* Search Section */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Search</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search hashtags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Trending Tags */}
        <Card className="flex-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Trending Tags</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-3">
            {trendingTags.map((item, index) => (
              <motion.div
                key={item.tag}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between p-2 rounded-lg hover:bg-accent/50 cursor-pointer transition-colors"
              >
                <div>
                  <div className="font-medium text-sm">{item.tag}</div>
                  <div className="text-xs text-muted-foreground">{item.posts} posts</div>
                </div>
                <Badge variant="secondary" className="text-xs">
                  Trending
                </Badge>
              </motion.div>
            ))}
          </CardContent>
        </Card>

        {/* Footer Section */}
        <div className="space-y-4 mt-auto">
          {/* Theme Toggle */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Theme</span>
            <ThemeToggle />
          </div>

          {/* Links */}
          <div className="space-y-2">
            <Button variant="ghost" size="sm" className="w-full justify-start text-xs">
              <Shield className="h-3 w-3 mr-2" />
              Privacy Policy
            </Button>
            <Button variant="ghost" size="sm" className="w-full justify-start text-xs">
              <Info className="h-3 w-3 mr-2" />
              Terms of Service
            </Button>
            <Button variant="ghost" size="sm" className="w-full justify-start text-xs">
              <Info className="h-3 w-3 mr-2" />
              About
            </Button>
            <Button variant="ghost" size="sm" className="w-full justify-start text-xs">
              <Github className="h-3 w-3 mr-2" />
              GitHub
            </Button>
          </div>
        </div>
      </div>
    </motion.aside>
  )
}
