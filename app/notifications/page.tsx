"use client"

import { AppLayout } from "@/components/layout/app-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Bell, Heart, Repeat2, MessageCircle, UserPlus } from "lucide-react"
import { motion } from "framer-motion"

export default function NotificationsPage() {
  const notifications = [
    {
      id: 1,
      type: "favourite",
      user: { name: "Sarah Johnson", handle: "@sarah@fosstodon.org", avatar: "/diverse-woman-avatar.png" },
      content: "liked your post",
      time: "2 minutes ago",
      unread: true,
    },
    {
      id: 2,
      type: "reblog",
      user: { name: "Alex Chen", handle: "@alex@mastodon.social", avatar: "/diverse-user-avatars.png" },
      content: "boosted your post",
      time: "15 minutes ago",
      unread: true,
    },
    {
      id: 3,
      type: "mention",
      user: { name: "Dev Community", handle: "@dev@tech.lgbt", avatar: "/tech-community-logo.png" },
      content: "mentioned you in a post",
      time: "1 hour ago",
      unread: false,
    },
    {
      id: 4,
      type: "follow",
      user: { name: "Maya Patel", handle: "@maya@social.vivaldi.net", avatar: "/diverse-designer-avatars.png" },
      content: "started following you",
      time: "3 hours ago",
      unread: false,
    },
  ]

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "favourite":
        return <Heart className="w-4 h-4 text-accent" />
      case "reblog":
        return <Repeat2 className="w-4 h-4 text-secondary" />
      case "mention":
        return <MessageCircle className="w-4 h-4 text-primary" />
      case "follow":
        return <UserPlus className="w-4 h-4 text-primary" />
      default:
        return <Bell className="w-4 h-4" />
    }
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div className="flex items-center space-x-3">
            <Bell className="w-8 h-8 text-accent" />
            <h1 className="text-3xl font-bold">Notifications</h1>
          </div>
          <Badge variant="secondary">{notifications.filter((n) => n.unread).length} unread</Badge>
        </motion.div>

        <div className="space-y-3">
          {notifications.map((notification, index) => (
            <motion.div
              key={notification.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card
                className={`transition-all duration-200 hover:shadow-md ${notification.unread ? "border-primary/50 bg-primary/5" : ""}`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    <Avatar className="ring-2 ring-primary/20">
                      <AvatarImage src={notification.user.avatar || "/placeholder.svg"} alt={notification.user.name} />
                      <AvatarFallback>{notification.user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center space-x-2">
                        {getNotificationIcon(notification.type)}
                        <p className="text-sm">
                          <span className="font-medium">{notification.user.name}</span>
                          <span className="text-muted-foreground"> {notification.content}</span>
                        </p>
                      </div>
                      <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                        <span>{notification.user.handle}</span>
                        <span>•</span>
                        <span>{notification.time}</span>
                      </div>
                    </div>
                    {notification.unread && <div className="w-2 h-2 bg-primary rounded-full"></div>}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </AppLayout>
  )
}
