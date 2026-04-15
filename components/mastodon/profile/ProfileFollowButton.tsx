'use client'

import { useState } from "react"
import { Loader2, UserCheck, UserPlus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { useMasto } from "@/components/auth/masto-provider"

type RelationshipLike = {
  following?: boolean | null
  requested?: boolean | null
} | null

export function ProfileFollowButton({
  accountId,
  accountUrl,
  canInteract,
  initialRelationship,
  locked,
}: {
  accountId: string
  accountUrl: string
  canInteract: boolean
  initialRelationship: RelationshipLike
  locked: boolean
}) {
  const { client } = useMasto()
  const [relationship, setRelationship] = useState(initialRelationship)
  const [isPending, setIsPending] = useState(false)

  if (!canInteract) {
    return (
      <Button asChild size="lg" className="rounded-full px-6">
        <a href={accountUrl} target="_blank" rel="noreferrer">
          {"\u67e5\u770b\u4e3b\u9875"}
        </a>
      </Button>
    )
  }

  const isFollowing = !!relationship?.following
  const isRequested = !!relationship?.requested

  const handleClick = async () => {
    if (isPending) return

    setIsPending(true)
    try {
      const nextRelationship = isFollowing
        ? await client.v1.accounts.$select(accountId).unfollow()
        : await client.v1.accounts.$select(accountId).follow()

      setRelationship(nextRelationship)
    } finally {
      setIsPending(false)
    }
  }

  return (
    <Button
      size="lg"
      onClick={handleClick}
      disabled={isPending}
      variant={isFollowing || isRequested ? "outline" : "default"}
      className="rounded-full px-6"
    >
      {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : isFollowing ? <UserCheck className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />}
      {isFollowing
        ? "\u5df2\u5173\u6ce8"
        : isRequested
          ? locked
            ? "\u8bf7\u6c42\u5df2\u53d1\u9001"
            : "\u5904\u7406\u4e2d"
          : "\u5173\u6ce8"}
    </Button>
  )
}
