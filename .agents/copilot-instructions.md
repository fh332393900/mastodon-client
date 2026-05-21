# Copilot instructions (v0-mastodon-client)

## Project overview
- Next.js App Router Mastodon client with React Query caching and Mastodon API via `masto`.
- Core flow: `app/**` routes → `hooks/mastodon/**` data hooks → `masto` client → React Query cache.

## Key directories & files
- `app/**`: route pages and layouts (App Router). API routes under `app/api/**`.
- `components/mastodon/**`: Mastodon UI (statuses, compose, emoji, timeline).
- `hooks/mastodon/**`: data fetching/cache hooks (e.g. timelines, explore, favorites).
- `lib/mastodon/contentToReactNode.tsx`: HTML/markdown → React nodes, code blocks, emoji rendering.
- `components/mastodon/compose-editor.tsx`: contentEditable compose editor with emoji + markdown shortcuts + Shiki overlay for code blocks.
- `components/providers/react-query-provider.tsx`: React Query client defaults.
- `app/i18n.ts` + `messages/*.json`: locale list and translations.

## Conventions & patterns
- React Query is the source of truth for timelines/favorites; update cache on mutations rather than refetching when possible.
- Custom emojis are cached via `useCustomEmojis` and merged with per-status emoji lists.
- Compose editor serializes DOM back to markdown text (emoji as `:shortcode:`, code blocks as fenced ```lang blocks).
- Code blocks in compose use Shiki overlay; editable layer is `data-code-input` and overlay is non-interactive.
- i18n keys live in `messages/*.json`; keep all 6 locales in sync with `app/i18n.ts`.

## Auth & instance handling
- Mastodon instance and token come from cookies (`mastodon_server`, `mastodon_token`), passed into client providers.
- API routes are under `app/api/[server]/**` and expect `server` param to target instances.

## Dev workflows
- Install: `pnpm install`
- Dev server: `pnpm run dev`
- Lint: `pnpm lint`
- Build: `pnpm run build`

## Git commit messages
- Any generated git commit message must be written in English only.
- Do not output Chinese or bilingual commit messages, even when the prompt is in Chinese.
- Return only the final commit message text unless the user explicitly asks for alternatives or explanation.
- Keep the subject concise, imperative, and under 72 characters when possible.

## When changing UI/logic
- Prefer adding hooks in `hooks/mastodon/**` over embedding fetch logic in components.
- Keep compose editor changes compatible with `getEditorText` serialization.
- Use `ContentCode`/`contentToReactNode.tsx` patterns for code rendering in read views.

# Project Rules

- Use TypeScript only and keep types explicit; avoid `any`.
- Prefer React hooks for shared state, derived data, side effects, and Mastodon data access.
- Keep route pages thin: put Mastodon fetching/caching logic in `hooks/mastodon/**`, not directly in JSX-heavy components.
- For list or feed pages, reuse `components/mastodon/infinite-scroller.tsx` and provide a stable `scrollCacheKey`.
- Treat React Query as the source of truth for Mastodon lists; prefer cache updates over full refetch after mutations.
- Mastodon client access should follow the existing client-side pattern with `useMasto()` / `useAuth()` and `client.v1.*`.
- Keep Mastodon instance and auth token handling compatible with existing cookie-based flow (`mastodon_server`, `mastodon_token`).
- Reuse existing Mastodon UI building blocks before creating new ones, especially `StatusCard`, compose-related components, and content rendering helpers.
- Keep compose editor changes compatible with markdown serialization, custom emoji handling, and fenced code block output.
- Reuse `lib/mastodon/contentToReactNode.tsx` and related code-rendering helpers for read views instead of introducing parallel renderers.
- All user-facing strings must use `next-intl`; add matching keys to every locale file in `messages/*.json`.
- Follow existing component conventions: PascalCase component files/symbols, typed props, and clear separation between view and logic.
- Add `"use client"` only when a component actually needs browser APIs, client hooks, or interactivity.
