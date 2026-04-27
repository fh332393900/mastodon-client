<p align="center">
  <img src="./public/icon.svg" alt="MastoClient" width="72" height="72" />
  <br />
  <a href="README.md">English</a>
  <a href="README.zh.md">简体中文</a>
</p>

<h1 align="center">Mastodon 客户端 (Next.js)</h1>

![Mastodon Client cover](./public/ScreenShotIndex.png)

![Mastodon Client cover](./public/ScreenShotHome.png)

这是一个基于 **Next.js App Router** 构建的 Mastodon Web 客户端。它支持时间线浏览、收藏、发帖、探索和基础设置。该项目使用 **React Query** 进行数据请求和缓存，并对无限滚动和滚动位置恢复进行了优化。

---

## 功能

- **Home / Local / Public 时间线**
  - 时间线切换
  - 无限滚动加载
  - 滚动位置缓存与恢复（返回列表不跳顶）
- **Favorites（收藏）**
  - 收藏列表缓存（Infinite Query）
  - 支持分页加载
- **Compose（发帖）**
  - 基础发帖流程（依赖登录态）
- **Explore（探索）**
  - 内容发现入口（可扩展为贴文、标签、最新、推荐关注等）
- **UI 与体验优化**
  - Skeleton Loading
  - 组件化 `StatusCard`
  - 响应式布局

---

## 技术栈

- **框架：** Next.js (App Router) + React + TypeScript
- **数据获取 / 缓存：** `@tanstack/react-query`（支持 `useInfiniteQuery`）
- **Mastodon API：** `masto`
- **UI：** Tailwind CSS + shadcn/ui（Button/Badge/Card 等）
- **部署：** Vercel

---

## 架构概览

> 以页面 -> hooks -> API client -> React Query cache 为主链路组织。

- `app/**`：路由页面（Favorites / Explore / Timeline 等）
- `components/**`：UI 组件（`StatusCard`、`InfiniteScroller` 等）
- `hooks/mastodon/**`：Mastodon 数据 hooks（如 `useFavoritesCache`、`useTimelineCache`）
- `components/mastodon/infinite-scroller.tsx`
  - 基于 IntersectionObserver 的无限加载
  - 可选 `scrollCacheKey` 用于滚动位置持久化/恢复

---

## 快速上手

### 1) 安装
```bash
pnpm install
```

### 2) 启动开发
```bash
pnpm run dev
```

打开：`http://localhost:3000`

---

## 部署

此项目可部署到 Vercel。
