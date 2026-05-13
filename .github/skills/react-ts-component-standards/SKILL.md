---
name: react-ts-component-standards
description: Enforce Next.js and React TypeScript component conventions, including PascalCase naming and strict separation of view and logic.
---

# React TS Component Standards Skill

Use this skill when creating or updating Next.js / React TypeScript components.

## Core Requirements

- **PascalCase naming (required):**
  - Component file names must be PascalCase, e.g. `UserCard.tsx`, `TimelineFeed.tsx`.
  - Exported component symbols must be PascalCase and match the file name.
  - Do not use kebab-case, snake_case, or camelCase for component file names.
- **View and logic separation (required):**
  - Keep view rendering in a pure presentational component.
  - Move data fetching, state orchestration, side effects, and event/business logic into hooks or container components.
  - Prefer `useXxx` hooks for reusable logic.
- **TypeScript first:**
  - Explicitly define `Props` types/interfaces for components.
  - Avoid `any`; use narrow types and unions where possible.
- **Next.js boundaries:**
  - Add `"use client"` only when client-side APIs/hooks are needed.
  - Keep server components free from browser-only logic.

## Recommended Patterns

### Pattern 1: Hook + View Component

- `useXxxModel.ts`: handles state, effects, derived data, actions.
- `XxxView.tsx`: receives typed props and renders UI only.
- `Xxx.tsx` (optional wrapper): wires model to view.

### Pattern 2: Container + Presentational Split

- `XxxContainer.tsx`: data querying/mutations/integration.
- `XxxView.tsx`: visual output, no API calls.

## Example

```tsx
"use client"

import { useMemo, useState } from "react"

interface ProfileCardViewProps {
  displayName: string
  initials: string
  onFollow: () => void
  isFollowing: boolean
}

export function ProfileCardView({
  displayName,
  initials,
  onFollow,
  isFollowing,
}: ProfileCardViewProps) {
  return (
    <section className="rounded-xl border p-4">
      <div className="mb-3 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
          {initials}
        </div>
        <h2 className="text-base font-semibold">{displayName}</h2>
      </div>
      <button type="button" onClick={onFollow} className="rounded-md border px-3 py-2">
        {isFollowing ? "Following" : "Follow"}
      </button>
    </section>
  )
}

function useProfileCardModel(name: string) {
  const [isFollowing, setIsFollowing] = useState(false)

  const initials = useMemo(() => {
    return name
      .split(" ")
      .map((v) => v[0] ?? "")
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }, [name])

  const onFollow = () => setIsFollowing((prev) => !prev)

  return {
    displayName: name,
    initials,
    isFollowing,
    onFollow,
  }
}

export function ProfileCard() {
  const model = useProfileCardModel("Ada Lovelace")
  return <ProfileCardView {...model} />
}
```

## Anti-Patterns

- Putting API calls directly in a pure UI component intended for reuse.
- Mixing heavy transformation/business rules inside JSX blocks.
- Exporting unnamed default component functions.
- Component files named like `user-card.tsx`, `userCard.tsx`, or `profile_card.tsx`.

## Done Checklist

- Component file and symbol names use PascalCase consistently.
- View rendering and business/data logic are separated.
- Reusable logic is extracted to `useXxx` hooks or container components.
- Props are typed and `any` is avoided.
- `"use client"` is used only where required.
