"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Heart, MessageCircle, Repeat2, Share, MoreHorizontal, Clock, Globe } from "lucide-react"
import { cn } from "@/lib/utils"
import { useMasto } from "@/components/auth/masto-provider"
import MastodonContent from '@/components/mastodon/MastodonContent'
import { mastodon } from "masto"

interface Post {
  id: string
  content: string
  account: {
    id: string
    username: string
    displayName: string
    avatar: string
    acct: string
  }
  createdAt: string
  favouritesCount: number
  reblogsCount: number
  repliesCount: number
  favourited: boolean
  reblogged: boolean
  visibility?: "public" | "unlisted" | "private" | "direct"
  mediaAttachments?: Array<{
    type: "image" | "video"
    url: string
    description?: string
  }>
}

function PostCard({ status, index }: { status: mastodon.v1.Status; index: number }) {
  const post = status.reblog ?? status
  const [isLiked, setIsLiked] = useState(post.favourited)
  const [isReposted, setIsReposted] = useState(post.reblogged)
  const [likes, setLikes] = useState(post.favouritesCount)
  const [reposts, setReposts] = useState(post.reblogsCount)

  const { client } = useMasto()

  const handleLike = async () => {
    try {
      const status = !isLiked ? await client.v1.statuses.$select(post.id).favourite() : await client.v1.statuses.$select(post.id).unfavourite()
      console.log(status)
      if (status) {
        setIsLiked(!isLiked)
        setLikes(isLiked ? likes - 1 : likes + 1)
      }
    } catch (error) {
      console.error("Failed to toggle like:", error)
    }
  }

  const handleRepost = async () => { 
    try {
      const method = isReposted ? "DELETE" : "POST"
      const response = await fetch(`/api/posts/${post.id}/reblog`, {
        method,
        headers: { "Content-Type": "application/json" },
      })

      if (response.ok) {
        setIsReposted(!isReposted)
        setReposts(isReposted ? reposts - 1 : reposts + 1)
      }
    } catch (error) {
      console.error("Failed to toggle repost:", error)
    }
  }

  const formatTimestamp = (isoString: string) => {
    const date = new Date(isoString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

    if (diffInHours < 1) return "Just now"
    if (diffInHours < 24) return `${diffInHours}h ago`
    return date.toLocaleDateString()
  }

  return (
    <div className="group">
      <Card className="bg-card/50 backdrop-blur-sm border-border/50 hover:border-primary/20 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5">
        <div>
          {status.reblog ? (
            <div className="px-6 mb-1 flex items-center gap-2 text-xs text-muted-foreground">
              <Repeat2 className="h-5 w-5 text-accent" />
              <Avatar className="ring-2 ring-primary/20 transition-all duration-200 group-hover:ring-primary/40 h-6 w-6">
                <AvatarImage src={status.account.avatar || "/placeholder.svg"} alt={status.account.displayName} />
                <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-primary-foreground">
                  {status.account.displayName.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <span>{status.account.displayName || status.account.username} {"\u8f6c\u53d1\u4e86\u8fd9\u6761\u8d34\u6587"}</span>
            </div>
          ) : null}
        </div>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <Avatar className="ring-2 ring-primary/20 transition-all duration-200 group-hover:ring-primary/40 h-12 w-12">
                <AvatarImage src={post.account.avatar || "/placeholder.svg"} alt={post.account.displayName} />
                <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-primary-foreground">
                  {post.account.displayName.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <h3 className="font-semibold text-foreground hover:text-primary transition-colors cursor-pointer">
                    {post.account.displayName}
                  </h3>
                  <Badge variant="default" className="text-xs">
                    @{post.account.acct}
                  </Badge>
                </div>
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  <span>{formatTimestamp(post.createdAt)}</span>
                  <Globe className="w-3 h-3" />
                  <span className="capitalize">{post.visibility || "public"}</span>
                </div>
              </div>
            </div>
            <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <div className="text-foreground leading-relaxed">
              <MastodonContent content={post.content} />
            </div>
          </div>

          {post.mediaAttachments && post.mediaAttachments.length > 0 && (
            <div className={`grid gap-3 ${
              post.mediaAttachments.length === 1
                ? "grid-cols-1"
                : "sm:grid-cols-2"
            }`}>
              {post.mediaAttachments.map((item) => (
                <div key={item.id} className="overflow-hidden rounded-2xl border border-border/60 bg-muted/40">
                  {item.type === "image" ? (
                    <img
                      src={item.previewUrl || item.url || undefined}
                      alt={item.description || "media"}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <video src={item.url || undefined} controls className="h-auto w-full" />
                  )}
                </div>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between pt-2 border-t border-border/30">
            <div className="flex items-center space-x-6">
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-primary transition-colors space-x-2"
              >
                <MessageCircle className="w-4 h-4" />
                <span className="text-sm">{post.repliesCount || 0}</span>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={handleRepost}
                className={cn(
                  "transition-all duration-200 space-x-2",
                  isReposted ? "text-secondary hover:text-secondary/80" : "text-muted-foreground hover:text-secondary",
                )}
              >
                <Repeat2 className={cn("w-4 h-4", isReposted && "animate-pulse")} />
                <span className="text-sm">{reposts}</span>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={handleLike}
                className={cn(
                  "transition-all duration-200 space-x-2",
                  isLiked ? "text-red-500 hover:text-red-500/80" : "text-muted-foreground hover:text-red-500",
                )}
              >
                <Heart className={cn("w-4 h-4", isLiked && "fill-current")} />
                <span className="text-sm">{likes}</span>
              </Button>
            </div>

            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary transition-colors">
              <Share className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export function TimelineFeed() {
  const [posts, setPosts] = useState<mastodon.v1.Status[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [timelineType, setTimelineType] = useState<"public" | "home" | "local">("public")
  const { client } = useMasto()

  const limit = 20
  const sentinelRef = useRef<HTMLDivElement | null>(null)

  const fetchTimeline = useCallback(
    async (maxId?: string, append = false) => {
      if (!client) return
      try {
        if (append) setLoadingMore(true)
        else setIsLoading(true)

        const params: any = { limit }
        if (maxId) params.max_id = maxId

        // using home timeline endpoint as before; adapt per timelineType later if needed
        const res = await client.v1.timelines.home.list(params)
        const newPosts = (res as mastodon.v1.Status[]) || []

        setPosts((prev) => {
          if (!append) return newPosts
          // avoid duplicates by id
          const existing = new Set(prev.map((p) => p.id))
          const filtered = newPosts.filter((p) => !existing.has(p.id))
          return [...prev, ...filtered]
        })

        // if returned less than limit, no more pages
        setHasMore(newPosts.length === limit)
      } catch (error) {
        console.error('Failed to fetch timeline:', error)
      } finally {
        setIsLoading(false)
        setLoadingMore(false)
      }
    },
    [client],
  )

  // initial load and when timelineType changes
  useEffect(() => {
    setPosts([])
    setHasMore(true)
    fetchTimeline(undefined, false)
  }, [timelineType, fetchTimeline])

  // intersection observer for infinite scroll
  useEffect(() => {
    if (!sentinelRef.current) return
    const el = sentinelRef.current
    const observer = new IntersectionObserver(
      (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting && hasMore && !loadingMore && !isLoading && posts.length > 0) {
              const lastId = posts[posts.length - 1].id
              fetchTimeline(lastId, true)
            }
          })
        },
      { root: null, rootMargin: '500px', threshold: 0.1 },
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [posts, hasMore, loadingMore, isLoading, fetchTimeline])

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Timeline</h1>
          <div className="flex space-x-2">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="w-3 h-3 bg-primary rounded-full animate-pulse"
                style={{ animationDelay: `${i * 0.2}s` }}
              />
            ))}
          </div>
        </div>
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-muted rounded-full" />
                <div className="space-y-2">
                  <div className="w-32 h-4 bg-muted rounded" />
                  <div className="w-24 h-3 bg-muted rounded" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="w-full h-4 bg-muted rounded" />
                <div className="w-3/4 h-4 bg-muted rounded" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-primary">Timeline</h1>
        <div className="flex items-center space-x-2">
          <div className="flex rounded-lg border border-border/50 p-1">
            {(["public", "local", "home"] as const).map((type) => (
              <Button
                key={type}
                variant={timelineType === type ? "default" : "ghost"}
                size="sm"
                onClick={() => setTimelineType(type)}
                className="capitalize text-xs"
              >
                {type}
              </Button>
            ))}
          </div>
          <Badge variant="outline" className="text-accent border-accent/50">
            {posts.length} posts
          </Badge>
        </div>
  </div>

      <div className="bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10 rounded-lg p-4 border border-primary/20">
        <p className="text-sm text-muted-foreground text-center">
          {timelineType === "home"
            ? "Your personalized home timeline"
            : timelineType === "local"
              ? "Local community timeline"
              : "Public fediverse timeline"}
        </p>
      </div>

      <div className="space-y-6">
        {posts.map((post, index) => (
          <PostCard key={post.id} status={post} index={index} />
        ))}
      </div>

      <div ref={sentinelRef} aria-hidden className="w-full h-2" />

      {loadingMore && (
        <div className="space-y-4">
          {[...Array(2)].map((_, i) => (
            <Card key={`skeleton-${i}`} className="animate-pulse">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-muted rounded-full" />
                  <div className="space-y-2">
                    <div className="w-32 h-4 bg-muted rounded" />
                    <div className="w-24 h-3 bg-muted rounded" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="w-full h-4 bg-muted rounded" />
                  <div className="w-3/4 h-4 bg-muted rounded" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
