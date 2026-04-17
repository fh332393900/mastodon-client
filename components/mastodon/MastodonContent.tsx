import { contentToReactNode } from '@/lib/mastodon/contentToReactNode'

export default function MastodonContent({
  content,
  emojis,
}: {
  content: string
  emojis?: import("masto").mastodon.v1.CustomEmoji[]
}) {
  return (
    <div className="prose max-w-none break-words text-small content-rich">
      {contentToReactNode(content, emojis)}
    </div>
  )
}
