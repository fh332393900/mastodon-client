"use client"

import type { ReactNode } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

const tabs = [
  { href: "", label: "Posts" },
  { href: "tag", label: "Tags" },
  { href: "news", label: "News" },
  { href: "suggested", label: "Suggested" },
] as const

export default function ExploreLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname()

  const server = pathname.split("/")[1]

  return (
    <div className="space-y-4">
      <div className="sticky top-0 z-20 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div>
          <nav className="grid grid-cols-4 border-b border-border">
          {tabs.map((t) => {
            const fullHref = `/${server}/explore/${t.href}`
            const active = pathname.endsWith(`/explore/${t.href}`) || (t.href === "" && pathname.endsWith("/explore"))
            return (
              <Link
                key={t.href}
                href={fullHref}
                className={cn(
                  "relative flex h-12 md:h-15 items-center justify-center text-sm font-medium transition-colors",
                  "text-muted-foreground hover:text-foreground hover:bg-muted/50",
                  active && "text-foreground",
                )}
              >
                {t.label}
                <span
                  aria-hidden="true"
                  className={cn(
                    "pointer-events-none absolute bottom-0 left-0 h-0.5 w-full bg-transparent",
                    active && "bg-primary",
                  )}
                />
              </Link>
            )
          })}
          </nav>
        </div>
      </div>

      <div className="px-4 pb-2">{children}</div>
    </div>
  )
}
