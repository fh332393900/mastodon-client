"use client"

import type { mastodon } from "masto"

import { ReplyItem } from "@/components/mastodon/status-detail/ReplyItem"

export type ReplyGroup = {
  root: mastodon.v1.Status
  replies: mastodon.v1.Status[]
}

export function buildReplyGroups(
  replies: mastodon.v1.Status[],
  rootId: string,
): ReplyGroup[] {
  const roots = replies.filter((reply) => reply.inReplyToId === rootId)
  const children = replies.filter((reply) => reply.inReplyToId && reply.inReplyToId !== rootId)

  const groups: ReplyGroup[] = roots.map((root) => ({ root, replies: [] }))
  const groupMap = new Map<string, ReplyGroup>()
  groups.forEach((group) => groupMap.set(group.root.id, group))

  children.forEach((reply) => {
    const parentId = reply.inReplyToId
    if (!parentId) return
    const group = groupMap.get(parentId)
    if (group) {
      group.replies.push(reply)
    }
  })

  groups.sort(
    (a, b) => new Date(a.root.createdAt).getTime() - new Date(b.root.createdAt).getTime(),
  )
  groups.forEach((group) => {
    group.replies.sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    )
  })

  return groups
}

export function ReplyList({ groups }: { groups: ReplyGroup[] }) {
  if (groups.length === 0) {
    return (
      <div className="rounded-3xl border border-border/60 bg-card/90 p-6 text-sm text-muted-foreground">
        还没有回复
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {groups.map((group) => (
        <div key={group.root.id} className="space-y-4">
          <ReplyItem status={group.root} showThreadLine={group.replies.length > 0} />
          {group.replies.length > 0 ? (
            <div className="space-y-4 border-l border-border/50 pl-6">
              {group.replies.map((reply) => (
                <ReplyItem key={reply.id} status={reply} />
              ))}
            </div>
          ) : null}
        </div>
      ))}
    </div>
  )
}
