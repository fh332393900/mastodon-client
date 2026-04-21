"use client"

import { useCallback, useState } from "react"
import { RefreshCw, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useMasto } from "@/components/auth/masto-provider"
import type { mastodon } from "masto"

interface StatusPollProps {
  poll: mastodon.v1.Poll
  onPollUpdate?: (poll: mastodon.v1.Poll) => void
}

function toPercentage(ratio: number) {
  const p = (ratio * 100).toFixed(1).replace(/\.?0+$/, "")
  return `${p}%`
}

export function StatusPoll({ poll: initialPoll, onPollUpdate }: StatusPollProps) {
  const { client } = useMasto()
  const [poll, setPoll] = useState<mastodon.v1.Poll>({ ...initialPoll })
  const [selected, setSelected] = useState<number[]>([])
  const [loading, setLoading] = useState(false)

  const votersCount = poll.votersCount ?? poll.votesCount ?? 0
  const isExpired = poll.expired || (poll.expiresAt ? new Date(poll.expiresAt) < new Date() : false)
  const canVote = !poll.voted && !isExpired

  const handleSelect = (index: number) => {
    if (!canVote) return
    if (poll.multiple) {
      setSelected((prev) =>
        prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index],
      )
    } else {
      setSelected([index])
    }
  }

  const handleVote = useCallback(async () => {
    if (!client || selected.length === 0) return
    setLoading(true)
    try {
      const updated: mastodon.v1.Poll = {
        ...poll,
        voted: true,
        ownVotes: selected,
        votesCount: (poll.votesCount ?? 0) + selected.length,
        votersCount: (poll.votersCount ?? 0) + 1,
        options: poll.options.map((opt, i) => ({
          ...opt,
          votesCount: selected.includes(i) ? (opt.votesCount ?? 0) + 1 : (opt.votesCount ?? 0),
        })),
      }
      setPoll(updated)
      onPollUpdate?.(updated)
      await client.v1.polls.$select(poll.id).votes.create({ choices: selected })
    } catch (e) {
      console.error(e)
      setPoll({ ...initialPoll })
    } finally {
      setLoading(false)
    }
  }, [client, poll, selected, initialPoll, onPollUpdate])

  const handleRefresh = useCallback(async () => {
    if (!client || loading) return
    setLoading(true)
    try {
      const newPoll = await client.v1.polls.$select(poll.id).fetch()
      setPoll(newPoll)
      onPollUpdate?.(newPoll)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [client, poll.id, loading, onPollUpdate])

  const expiresAt = poll.expiresAt ? new Date(poll.expiresAt) : null
  const expiresLabel = expiresAt
    ? isExpired
      ? `已结束 · ${expiresAt.toLocaleDateString("zh-CN")}`
      : `截止 ${expiresAt.toLocaleDateString("zh-CN", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}`
    : null

  return (
    <div className="mt-1 flex flex-col gap-3 w-full">
      {canVote ? (
        <>
          <div className="flex flex-col gap-2">
            {poll.options.map((option, index) => {
              const isChecked = selected.includes(index)
              return (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleSelect(index)}
                  className={cn(
                    "flex items-center gap-3 rounded-xl border px-4 py-2.5 text-sm text-left transition-colors",
                    isChecked
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border/60 bg-muted/30 hover:border-primary/50 hover:bg-muted/60",
                  )}
                >
                  <span
                    className={cn(
                      "flex h-4 w-4 shrink-0 items-center justify-center border transition-colors",
                      poll.multiple ? "rounded-md" : "rounded-full",
                      isChecked ? "border-primary bg-primary" : "border-border",
                    )}
                  >
                    {isChecked && (
                      <span className={cn(
                        "block h-2 w-2 bg-white",
                        poll.multiple ? "rounded-sm" : "rounded-full",
                      )} />
                    )}
                  </span>
                  {option.title}
                </button>
              )
            })}
          </div>
          <Button
            size="sm"
            disabled={selected.length === 0 || loading}
            onClick={handleVote}
            className="w-full rounded-xl"
          >
            投票
          </Button>
        </>
      ) : (
        <div className="flex flex-col gap-2.5">
          {poll.options.map((option, index) => {
            const ratio = votersCount > 0 ? (option.votesCount ?? 0) / votersCount : 0
            const pct = toPercentage(ratio)
            const isOwn = poll.ownVotes?.includes(index)

            return (
              <div key={index} className="flex flex-col gap-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="inline-flex items-center gap-1.5">
                    {option.title}
                    {isOwn && (
                      <CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0" />
                    )}
                  </span>
                  <span className="text-primary font-medium tabular-nums">{pct}</span>
                </div>
                <div className="h-[5px] w-full overflow-hidden rounded-full bg-border/50">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all duration-700 ease-out",
                      isOwn ? "bg-primary" : "bg-primary/45",
                    )}
                    style={{ width: pct }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      )}

      <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
        <div className="flex items-center gap-1 flex-wrap">
          <span>{poll.votesCount ?? 0} 票</span>
          {expiresLabel && (
            <>
              <span>·</span>
              <span>{expiresLabel}</span>
            </>
          )}
        </div>
        {!isExpired && (
          <button
            type="button"
            onClick={handleRefresh}
            disabled={loading}
            className="inline-flex items-center gap-1 hover:text-primary transition-colors disabled:opacity-50"
          >
            <RefreshCw className={cn("h-3.5 w-3.5", loading && "animate-spin")} />
            刷新
          </button>
        )}
      </div>
    </div>
  )
}
