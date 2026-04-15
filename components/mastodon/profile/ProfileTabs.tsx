'use client'

import Link from "next/link"
import { usePathname } from "next/navigation"

import { cn } from "@/lib/utils"

type TabItem = {
  href: string
  label: string
  count: number
  exact?: boolean
}

export function ProfileTabs({ tabs }: { tabs: TabItem[] }) {
  const pathname = usePathname()

  return (
    <nav className="flex gap-2 overflow-x-auto border-t border-border/70 px-2 pb-2 pt-3">
      {tabs.map((tab) => {
        const isActive = tab.exact ? pathname === tab.href : pathname.startsWith(tab.href)

        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              "min-w-fit rounded-full px-4 py-2 text-sm font-medium transition-colors",
              isActive
                ? "bg-foreground text-background"
                : "bg-muted/70 text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            {tab.label} {tab.count}
          </Link>
        )
      })}
    </nav>
  )
}
