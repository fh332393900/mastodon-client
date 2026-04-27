<p align="center">
  <img src="./public/icon.svg" alt="MastoClient" width="72" height="72" />
  <br />
  <a href="README.md">English</a>
  <a href="README.zh.md">简体中文</a>
</p>

<h1 align="center">Mastodon Client (Next.js)</h1>

![Mastodon Client cover](./public/ScreenShotIndex.png)

![Mastodon Client cover](./public/ScreenShotHome.png)

This is a Mastodon web client built with **Next.js App Router**. It supports timeline browsing, favorites, posting, exploration, and basic settings. The project uses **React Query** for data fetching and caching, with optimizations for infinite scrolling and scroll position restoration.

---

## Features

- **Home / Local / Public timelines**
  - Timeline switching
  - Infinite scroll loading
  - Scroll position caching and restoration (no sudden jump when returning to a list)
- **Favorites**
  - Cached favorites list (Infinite Query)
  - Paginated loading support
- **Compose**
  - Basic posting workflow (requires login)
- **Explore**
  - Content discovery entry point (can be extended to posts, tags, latest, suggested follows, etc.)
- **UI and experience improvements**
  - Skeleton loading
  - Component-based `StatusCard`
  - Responsive layout


## Tech Stack

- **Framework:** Next.js (App Router) + React + TypeScript
- **Data Fetching / Cache:** `@tanstack/react-query` (supports `useInfiniteQuery`)
- **Mastodon API:** `masto`
- **UI:** Tailwind CSS + shadcn/ui (Button/Badge/Card, etc.)
- **Deployment:** Vercel


## Architecture Overview

> Organized around page -> hooks -> API client -> React Query cache.

- `app/**`: route pages (Favorites / Explore / Timeline, etc.)
- `components/**`: UI components (`StatusCard`, `InfiniteScroller`, etc.)
- `hooks/mastodon/**`: Mastodon data hooks (such as `useFavoritesCache`, `useTimelineCache`)
- `components/mastodon/infinite-scroller.tsx`
  - IntersectionObserver-based infinite load
  - Optional `scrollCacheKey` for scroll position persistence/restoration


## Getting Started

### 1) Install
```bash
pnpm install
```

### 2) Run dev
```bash
pnpm run dev
```

Open: `http://localhost:3000`


## Deployment

This project can be deployed to Vercel.
