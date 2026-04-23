import type { mastodon } from "masto"

/**
 * Groups timeline posts (newest-first order) into threads.
 *
 * Timeline API returns posts in reverse-chronological order, so a thread looks like:
 *   posts[i]   = newest reply   (inReplyToId === posts[i+1].id)
 *   posts[i+1] = earlier reply  (inReplyToId === posts[i+2].id)
 *   posts[i+2] = original post  (inReplyToId === null or outside thread)
 *
 * We collect the chain by checking posts[i].inReplyToId === posts[i+1].id (same author),
 * then reverse the group so it renders oldest → newest.
 *
 * Returns an array of groups; each group is an array of statuses in chronological order.
 * Singles are wrapped in a one-element array.
 */
export function groupThreadPosts(
  posts: mastodon.v1.Status[],
): mastodon.v1.Status[][] {
  const byId = new Map<string, mastodon.v1.Status>()
  const groupMap = new Map<string, mastodon.v1.Status[]>()
  const groupOrder = new Map<string, number>()

  posts.forEach((post) => {
    byId.set(post.id, post)
  })

  const getRootId = (post: mastodon.v1.Status) => {
    let current: mastodon.v1.Status | undefined = post
    while (current?.inReplyToId) {
      const parent = byId.get(current.inReplyToId)
      if (!parent) break
      if (
        current.inReplyToAccountId &&
        current.inReplyToAccountId !== current.account.id
      ) {
        break
      }
      if (parent.account.id !== current.account.id) break
      current = parent
    }
    return current?.id ?? post.id
  }

  posts.forEach((post, index) => {
    const rootId = getRootId(post)
    const group = groupMap.get(rootId) ?? []
    if (!group.find((item) => item.id === post.id)) {
      group.push(post)
    }
    groupMap.set(rootId, group)
    if (!groupOrder.has(rootId)) {
      groupOrder.set(rootId, index)
    }
  })

  const result = Array.from(groupMap.entries())
    .sort(([rootA], [rootB]) => (groupOrder.get(rootA) ?? 0) - (groupOrder.get(rootB) ?? 0))
    .map(([, group]) =>
      group.slice().sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()),
    )

  return result
}

