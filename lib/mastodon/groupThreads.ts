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
  const result: mastodon.v1.Status[][] = []
  let i = 0

  while (i < posts.length) {
    const group: mastodon.v1.Status[] = [posts[i]]

    // Extend the group while the current post replies to the next post (same author)
    while (
      i + 1 < posts.length &&
      posts[i].inReplyToId === posts[i + 1].id &&
      posts[i].account.id === posts[i + 1].account.id
    ) {
      i++
      group.push(posts[i])
    }

    // Reverse so the original post renders first (chronological order)
    if (group.length > 1) {
      group.reverse()
    }

    result.push(group)
    i++
  }

  return result
}

