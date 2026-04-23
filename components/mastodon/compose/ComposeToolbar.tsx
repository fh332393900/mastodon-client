"use client"

import { useState } from "react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"

interface ToolbarButtonProps {
  icon: React.ReactNode
  label: string
  onClick?: () => void
  disabled?: boolean
  active?: boolean
  children?: React.ReactNode
}

export function ToolbarButton({ icon, label, onClick, disabled, active, children }: ToolbarButtonProps) {
  const [open, setOpen] = useState(false)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          onClick={onClick}
          disabled={disabled}
          aria-label={label}
          className={cn(
            "inline-flex cursor-pointer h-8 w-8 items-center justify-center rounded-full text-foreground transition",
            "hover:bg-muted/70",
            active && "bg-muted/70 text-primary",
            disabled && "opacity-50 cursor-not-allowed",
          )}
          onMouseEnter={() => setOpen(true)}
          onMouseLeave={() => setOpen(false)}
        >
          {icon}
        </button>
      </PopoverTrigger>
      <PopoverContent
        side="top"
        align="center"
        className="w-auto px-3 py-2 text-xs"
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
      >
        {children ?? label}
      </PopoverContent>
    </Popover>
  )
}
